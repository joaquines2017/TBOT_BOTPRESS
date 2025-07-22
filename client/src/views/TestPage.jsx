import React from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody, CCardHeader } from '@coreui/react'

const TestPage = ({ title, message }) => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h4>{title}</h4>
            </CCardHeader>
            <CCardBody>
              <p>{message}</p>
              <p>Si ves esta página, significa que la ruta está funcionando correctamente.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default TestPage
