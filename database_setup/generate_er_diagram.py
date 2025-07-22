#!/usr/bin/env python3
"""
Script para generar diagrama ER de PostgreSQL
Requiere: pip install psycopg2 graphviz
"""

import psycopg2
import graphviz
from datetime import datetime

# Configuración de conexión
DB_CONFIG = {
    'host': 'localhost',
    'database': 'web-tbot',
    'user': 'postgres',
    'password': 'tu_password'  # Cambiar por tu password
}

def get_tables_and_columns():
    """Obtiene información de tablas y columnas"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Obtener tablas y columnas
    cur.execute("""
        SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            CASE WHEN pk.column_name IS NOT NULL THEN 'PK' ELSE '' END as is_primary_key
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN (
            SELECT ku.table_name, ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku 
                ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
    """)
    
    tables = {}
    for row in cur.fetchall():
        table_name, column_name, data_type, nullable, is_pk = row
        if table_name not in tables:
            tables[table_name] = []
        tables[table_name].append({
            'name': column_name,
            'type': data_type,
            'nullable': nullable,
            'is_pk': is_pk
        })
    
    return tables

def get_foreign_keys():
    """Obtiene relaciones de foreign keys"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    """)
    
    return cur.fetchall()

def generate_diagram():
    """Genera el diagrama ER"""
    dot = graphviz.Digraph(comment='Web-TBot Database Schema')
    dot.attr(rankdir='TB', size='16,12')
    
    # Obtener datos
    tables = get_tables_and_columns()
    foreign_keys = get_foreign_keys()
    
    # Crear nodos (tablas)
    for table_name, columns in tables.items():
        # Crear HTML para la tabla
        html_table = f'''<
        <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="lightblue" COLSPAN="2"><B>{table_name}</B></TD></TR>
        '''
        
        for col in columns:
            pk_marker = '🔑 ' if col['is_pk'] == 'PK' else ''
            nullable_marker = '' if col['nullable'] == 'NO' else ' (null)'
            html_table += f'''
            <TR>
                <TD ALIGN="LEFT">{pk_marker}{col['name']}</TD>
                <TD ALIGN="LEFT">{col['type']}{nullable_marker}</TD>
            </TR>
            '''
        
        html_table += '</TABLE>>'
        
        dot.node(table_name, html_table, shape='plaintext')
    
    # Crear relaciones (foreign keys)
    for fk in foreign_keys:
        table_name, column_name, foreign_table, foreign_column = fk
        dot.edge(table_name, foreign_table, 
                label=f'{column_name} -> {foreign_column}',
                color='red', fontsize='10')
    
    # Guardar diagrama
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'database_diagram_{timestamp}'
    
    dot.render(filename, format='png', cleanup=True)
    dot.render(filename, format='svg', cleanup=True)
    
    print(f"✅ Diagrama generado: {filename}.png y {filename}.svg")
    return filename

if __name__ == "__main__":
    try:
        generate_diagram()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Asegúrate de:")
        print("1. Tener instalado: pip install psycopg2 graphviz")
        print("2. Configurar correctamente DB_CONFIG")
        print("3. Que PostgreSQL esté corriendo")
