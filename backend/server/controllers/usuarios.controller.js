const db = require('../db')
const bcrypt = require('bcrypt')

// Función auxiliar para registrar auditoría
const registrarAuditoria = async (usuarioId, tabla, accion, usuarioResponsable, datosAnteriores = null, datosNuevos = null, observaciones = null, ipAddress = null, userAgent = null) => {
  try {
    await db.query(`
      INSERT INTO auditoria_usuarios 
      (usuario_id, tabla_afectada, accion, datos_anteriores, datos_nuevos, fecha_cambio, usuario_responsable, ip_address, user_agent, observaciones)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9)
    `, [
      usuarioId, 
      tabla || 'usuarios', 
      accion, 
      datosAnteriores ? JSON.stringify(datosAnteriores) : null,
      datosNuevos ? JSON.stringify(datosNuevos) : null,
      usuarioResponsable, 
      ipAddress, 
      userAgent, 
      observaciones
    ])
    
    console.log(`📋 Auditoría registrada: ${accion} usuario ${usuarioId} por usuario ${usuarioResponsable}`)
  } catch (err) {
    console.error('Error al registrar auditoría:', err.message)
  }
}

exports.getUsuarios = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.nombre, u.apellido, u.usuario, u.email, u.rol, u.activo, 
             u.alta_fecha as fecha_creacion,
             ubase.fecha_modificacion,
             uc.nombre || ' ' || uc.apellido as usuario_creacion_nombre,
             um.nombre || ' ' || um.apellido as usuario_modificacion_nombre,
             TO_CHAR(u.alta_fecha, 'DD/MM/YYYY HH24:MI:SS') as fecha_creacion_formateada,
             TO_CHAR(ubase.fecha_modificacion, 'DD/MM/YYYY HH24:MI:SS') as fecha_modificacion_formateada
      FROM usuarios_dashboard_compatible u
      LEFT JOIN usuarios ubase ON u.id = ubase.id
      LEFT JOIN usuarios uc ON u.alta_por::integer = uc.id
      LEFT JOIN usuarios um ON ubase.usuario_modificacion = um.id
      WHERE u.activo = true 
      ORDER BY u.id
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

exports.getUsuariosInactivos = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.nombre, u.apellido, u.usuario, u.email, u.rol, u.activo, 
             u.alta_fecha as fecha_creacion, 
             ubase.fecha_desactivacion,
             ubase.fecha_modificacion,
             uc.nombre || ' ' || uc.apellido as usuario_creacion_nombre,
             ud.nombre || ' ' || ud.apellido as usuario_desactivacion_nombre,
             um.nombre || ' ' || um.apellido as usuario_modificacion_nombre,
             TO_CHAR(u.alta_fecha, 'DD/MM/YYYY HH24:MI:SS') as fecha_creacion_formateada,
             TO_CHAR(ubase.fecha_modificacion, 'DD/MM/YYYY HH24:MI:SS') as fecha_modificacion_formateada,
             TO_CHAR(ubase.fecha_desactivacion, 'DD/MM/YYYY HH24:MI:SS') as fecha_desactivacion_formateada
      FROM usuarios_dashboard_compatible u
      LEFT JOIN usuarios ubase ON u.id = ubase.id
      LEFT JOIN usuarios uc ON u.alta_por::integer = uc.id
      LEFT JOIN usuarios ud ON ubase.usuario_desactivacion = ud.id
      LEFT JOIN usuarios um ON ubase.usuario_modificacion = um.id
      WHERE u.activo = false 
      ORDER BY ubase.fecha_desactivacion DESC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener usuarios inactivos' })
  }
}

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, usuario, contraseña, email, rol, usuarioActual } = req.body
    const userIdFromToken = req.usuario.id // ID del usuario desde el token
    
    console.log('CrearUsuario - Datos recibidos:', { nombre, apellido, usuario, email, rol })
    
    // Usar el ID del token si no se proporciona usuarioActual
    const responsableId = usuarioActual || userIdFromToken
    
    const passwordHash = await bcrypt.hash(contraseña, 10)
    
    // Insertar usuario en la tabla usuarios (sin campo rol)
    const result = await db.query(
      `INSERT INTO usuarios (nombre, apellido, usuario, password, email, activo, alta_fecha, alta_por) 
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, $6) RETURNING id`,
      [nombre, apellido, usuario, passwordHash, email, responsableId]
    )
    
    const nuevoUsuarioId = result.rows[0].id
    
    // Asignar rol al usuario
    if (rol) {
      // Mapear rol frontend a rol de la base de datos
      let nombreRol = rol
      if (rol === 'admin') nombreRol = 'Administrator'
      if (rol === 'tecnico') nombreRol = 'Tecnico'  
      if (rol === 'administrativo') nombreRol = 'Administrativo'
      
      // Obtener ID del rol
      const rolResult = await db.query('SELECT id FROM roles WHERE nombre = $1 AND activo = true', [nombreRol])
      
      if (rolResult.rows.length > 0) {
        const rolId = rolResult.rows[0].id
        
        // Asignar rol al nuevo usuario
        await db.query(`
          INSERT INTO usuarios_roles (usuario_id, rol_id, activo, fecha_asignacion, usuario_asignacion)
          VALUES ($1, $2, true, CURRENT_TIMESTAMP, $3)
        `, [nuevoUsuarioId, rolId, responsableId])
      }
    }
    
    // Registrar auditoría
    await registrarAuditoria(
      nuevoUsuarioId,
      'usuarios',
      'creado',
      responsableId,
      null,
      { nombre, apellido, usuario, email, rol },
      'Usuario creado desde la interfaz',
      req.ip,
      req.get('User-Agent')
    )
    
    res.status(201).json({ id: nuevoUsuarioId, message: 'Usuario creado exitosamente' })
  } catch (err) {
    console.error('Error al crear usuario:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

exports.editarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, usuario, email, rol, contraseña, usuarioActual } = req.body
    const userIdFromToken = req.usuario.id // ID del usuario desde el token
    
    console.log('EditarUsuario - ID:', id, 'Datos recibidos:', { nombre, apellido, usuario, email, rol })
    
    // Usar el ID del token si no se proporciona usuarioActual
    const responsableId = usuarioActual || userIdFromToken
    
    // Obtener datos anteriores para auditoría
    const datosAnteriores = await db.query('SELECT * FROM usuarios_dashboard_compatible WHERE id = $1', [id])
    
    // Actualizar datos básicos del usuario en la tabla usuarios
    let query = `UPDATE usuarios SET 
                 nombre = $1, 
                 apellido = $2, 
                 usuario = $3, 
                 email = $4, 
                 fecha_modificacion = CURRENT_TIMESTAMP, 
                 usuario_modificacion = $5`
    let params = [nombre, apellido, usuario, email, responsableId]
    
    // Si se proporciona nueva contraseña, la actualizamos
    if (contraseña) {
      const passwordHash = await bcrypt.hash(contraseña, 10)
      query += `, password = $${params.length + 1}`
      params.push(passwordHash)
    }
    
    query += ` WHERE id = $${params.length + 1}`
    params.push(id)
    
    await db.query(query, params)
    
    // Actualizar rol si se proporciona
    if (rol) {
      // Primero eliminar roles actuales del usuario
      await db.query('DELETE FROM usuarios_roles WHERE usuario_id = $1', [id])
      
      // Mapear rol frontend a rol de la base de datos
      let nombreRol = rol
      if (rol === 'admin') nombreRol = 'Administrator'
      if (rol === 'tecnico') nombreRol = 'Tecnico'  
      if (rol === 'administrativo') nombreRol = 'Administrativo'
      
      // Obtener ID del rol
      const rolResult = await db.query('SELECT id FROM roles WHERE nombre = $1 AND activo = true', [nombreRol])
      
      if (rolResult.rows.length > 0) {
        const rolId = rolResult.rows[0].id
        
        // Asignar nuevo rol
        await db.query(`
          INSERT INTO usuarios_roles (usuario_id, rol_id, activo, fecha_asignacion, usuario_asignacion)
          VALUES ($1, $2, true, CURRENT_TIMESTAMP, $3)
        `, [id, rolId, responsableId])
      }
    }
    
    // Registrar auditoría
    await registrarAuditoria(
      id,
      'usuarios',
      'editado',
      responsableId,
      datosAnteriores.rows[0],
      { nombre, apellido, usuario, email, rol },
      'Usuario editado desde la interfaz',
      req.ip,
      req.get('User-Agent')
    )
    
    res.json({ message: 'Usuario actualizado exitosamente' })
  } catch (err) {
    console.error('Error al editar usuario:', err)
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

exports.desactivarUsuario = async (req, res) => {
  console.log('🔄 INICIO desactivarUsuario - params:', req.params, 'body:', req.body)
  try {
    const { id } = req.params
    const { usuarioActual, observaciones } = req.body
    const userIdFromToken = req.usuario.id // ID del usuario desde el token
    
    // Usar el ID del token si no se proporciona usuarioActual
    const responsableId = usuarioActual || userIdFromToken
    
    console.log(`🔄 Desactivando usuario ${id} por usuario ${responsableId}`)
    
    // Obtener datos del usuario antes de desactivar
    const usuarioResult = await db.query('SELECT * FROM usuarios WHERE id = $1', [id])
    
    if (usuarioResult.rows.length === 0) {
      console.log(`❌ Usuario ${id} no encontrado`)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    const usuarioAnterior = usuarioResult.rows[0]
    
    // Desactivar usuario
    await db.query(
      `UPDATE usuarios SET 
       activo = false, 
       fecha_desactivacion = CURRENT_TIMESTAMP, 
       usuario_desactivacion = $1
       WHERE id = $2`,
      [responsableId, id]
    )
    
    console.log(`✅ Usuario ${id} desactivado exitosamente`)
    
    // Registrar auditoría
    await registrarAuditoria(
      id,
      'usuarios',
      'desactivado',
      responsableId,
      usuarioAnterior,
      { activo: false, fecha_desactivacion: new Date().toISOString(), usuario_desactivacion: responsableId },
      observaciones || 'Usuario desactivado desde la interfaz',
      req.ip,
      req.get('User-Agent')
    )
    
    res.json({ message: 'Usuario desactivado exitosamente' })
  } catch (err) {
    console.error('❌ Error al desactivar usuario:', err)
    res.status(500).json({ error: 'Error al desactivar usuario: ' + err.message })
  }
}

exports.reactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { usuarioActual, observaciones } = req.body
    const userIdFromToken = req.usuario.id // ID del usuario desde el token
    
    // Usar el ID del token si no se proporciona usuarioActual
    const responsableId = usuarioActual || userIdFromToken
    
    console.log(`🔄 Reactivando usuario ${id} por usuario ${responsableId}`)
    
    // Obtener datos del usuario antes de reactivar
    const usuarioResult = await db.query('SELECT * FROM usuarios WHERE id = $1', [id])
    
    if (usuarioResult.rows.length === 0) {
      console.log(`❌ Usuario ${id} no encontrado`)
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    const usuarioAnterior = usuarioResult.rows[0]
    
    // Reactivar usuario
    await db.query(
      `UPDATE usuarios SET 
       activo = true, 
       fecha_desactivacion = NULL, 
       usuario_desactivacion = NULL
       WHERE id = $1`,
      [id]
    )
    
    console.log(`✅ Usuario ${id} reactivado exitosamente`)
    
    // Registrar auditoría
    await registrarAuditoria(
      id,
      'usuarios',
      'reactivado',
      responsableId,
      usuarioAnterior,
      { activo: true, fecha_desactivacion: null, usuario_desactivacion: null },
      observaciones || 'Usuario reactivado desde la interfaz',
      req.ip,
      req.get('User-Agent')
    )
    
    res.json({ message: 'Usuario reactivado exitosamente' })
  } catch (err) {
    console.error('❌ Error al reactivar usuario:', err)
    res.status(500).json({ error: 'Error al reactivar usuario: ' + err.message })
  }
}

exports.getAuditoriaUsuario = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await db.query(`
      SELECT au.id,
             au.usuario_id,
             au.tabla_afectada,
             au.accion,
             au.datos_anteriores,
             au.datos_nuevos,
             au.fecha_cambio as fecha_hora,
             au.usuario_responsable,
             au.ip_address,
             au.user_agent,
             au.observaciones,
             ur.nombre || ' ' || ur.apellido as usuario_responsable_nombre,
             TO_CHAR(au.fecha_cambio, 'DD/MM/YYYY HH24:MI:SS') as fecha_formateada
      FROM auditoria_usuarios au
      LEFT JOIN usuarios ur ON au.usuario_responsable = ur.id
      WHERE au.usuario_id = $1
      ORDER BY au.fecha_cambio DESC
    `, [id])
    
    res.json(result.rows)
  } catch (err) {
    console.error('Error en getAuditoriaUsuario:', err)
    res.status(500).json({ error: 'Error al obtener auditoría' })
  }
}

exports.obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el usuario existe y está activo usando la vista de compatibilidad
    const result = await db.query(
      'SELECT id, nombre, apellido, email, usuario, rol FROM usuarios_dashboard_compatible WHERE id = $1 AND activo = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Agregar observaciones como campo vacío si no existe
    const userData = {
      ...result.rows[0],
      observaciones: ''
    };

    console.log('📋 obtenerPerfil - Usuario:', id, 'Datos:', userData);
    res.json(userData);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

exports.editarPerfil = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, email, contraseña } = req.body
    
    console.log('EditarPerfil - ID:', id, 'Datos recibidos:', { 
      nombre, 
      apellido, 
      email, 
      tieneContraseña: !!contraseña 
    })
    
    let query = `UPDATE usuarios SET 
                 nombre = $1, apellido = $2, email = $3`
    let params = [nombre, apellido, email]
    
    // Si se proporciona una nueva contraseña, incluirla en la actualización
    if (contraseña && contraseña.trim() !== '') {
      const passwordHash = await bcrypt.hash(contraseña, 10)
      query += `, password = $${params.length + 1}`
      params.push(passwordHash)
      console.log('🔑 Nueva contraseña será actualizada para usuario:', id)
    }
    
    query += ` WHERE id = $${params.length + 1}`
    params.push(id)
    
    console.log('🔄 Ejecutando query:', query)
    console.log('🔄 Parámetros:', params)
    
    const result = await db.query(query, params)
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    console.log('✅ Query ejecutada exitosamente, filas afectadas:', result.rowCount)
    
    // Verificar que los datos se guardaron correctamente (sin observaciones)
    const verificacion = await db.query(
      'SELECT nombre, apellido, email FROM usuarios WHERE id = $1',
      [id]
    )
    
    console.log('🔍 Verificación post-actualización:', verificacion.rows[0])
    
    // Registrar auditoría
    await registrarAuditoria(
      id,
      'usuarios',
      'perfil_editado',
      id, // El mismo usuario edita su perfil
      null,
      { nombre, apellido, email, contraseñaCambiada: !!contraseña },
      'Usuario editó su propio perfil',
      req.ip,
      req.get('User-Agent')
    )
    
    console.log('✅ Perfil actualizado exitosamente para usuario:', id)
    res.json({ message: 'Perfil actualizado exitosamente' })
  } catch (err) {
    console.error('❌ Error al editar perfil:', err)
    res.status(500).json({ error: 'Error al editar perfil' })
  }
}