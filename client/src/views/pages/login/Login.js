import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import fondoLogin from '../../../assets/images/fondoLogin.jpg'

const Login = () => {
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('🔐 [Login] Intentando login con:', usuario)
      
      const result = await login({ usuario, contraseña })
      
      if (result.success) {
        console.log('✅ [Login] Login exitoso, navegando al dashboard')
        navigate('/dashboard')
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('❌ [Login] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .form-control:focus {
          border-color: #2d5aa0 !important;
          box-shadow: 0 0 0 0.2rem rgba(45, 90, 160, 0.25) !important;
        }
        .card-group {
          display: flex !important;
          align-items: stretch !important;
        }
        .card-group .card {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
      <div 
        className="bg-light min-vh-100 d-flex flex-row align-items-center"
        style={{
          backgroundImage: `url(${fondoLogin})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
      {/* Overlay sutil y moderno */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(240,245,255,0.10) 100%)',
          backdropFilter: 'blur(6px)',
          zIndex: 1
        }}
      ></div>
      
      <CContainer style={{ position: 'relative', zIndex: 2 }}>
        <CRow className="justify-content-center">
          <CCol md={8} lg={7} xl={6}>
            <CCardGroup style={{ alignItems: 'stretch' }}>
              <CCard 
                className="p-4"
                style={{
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#343a40',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center' }}>
                      <h1 style={{ 
                        fontWeight: '300', 
                        color: '#ffffff',
                        marginBottom: '10px',
                        fontSize: '2.2rem'
                      }}>
                        Iniciar Sesión
                      </h1>
                      <p className="text-medium-emphasis" style={{
                        color: '#adb5bd',
                        marginBottom: '30px',
                        fontSize: '1rem'
                      }}>
                        Accedé al sistema
                      </p>
                    </div>

                    {error && <p className="text-danger" style={{
                      backgroundColor: '#721c24',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb',
                      color: '#f8d7da'
                    }}>{error}</p>}

                    <CInputGroup className="mb-3" style={{ marginBottom: '20px' }}>
                      <CInputGroupText style={{
                        backgroundColor: '#495057',
                        borderColor: '#6c757d',
                        borderRadius: '10px 0 0 10px',
                        color: '#ffffff'
                      }}>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Usuario"
                        autoComplete="username"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        style={{
                          borderColor: '#6c757d',
                          borderRadius: '0 10px 10px 0',
                          padding: '12px 15px',
                          fontSize: '1rem',
                          backgroundColor: '#495057',
                          color: '#ffffff',
                          textAlign: 'left',
                          '--cui-form-valid-border-color': '#2d5aa0',
                          '--cui-form-valid-color': '#2d5aa0'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2d5aa0'}
                        onBlur={(e) => e.target.style.borderColor = '#6c757d'}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4" style={{ marginBottom: '30px' }}>
                      <CInputGroupText style={{
                        backgroundColor: '#495057',
                        borderColor: '#6c757d',
                        borderRadius: '10px 0 0 10px',
                        color: '#ffffff'
                      }}>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        style={{
                          borderColor: '#6c757d',
                          borderRadius: '0 10px 10px 0',
                          padding: '12px 15px',
                          fontSize: '1rem',
                          backgroundColor: '#495057',
                          color: '#ffffff',
                          textAlign: 'left',
                          '--cui-form-valid-border-color': '#2d5aa0',
                          '--cui-form-valid-color': '#2d5aa0'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2d5aa0'}
                        onBlur={(e) => e.target.style.borderColor = '#6c757d'}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={12}>
                        <CButton 
                          type="submit" 
                          color="primary" 
                          className="px-4"
                          disabled={loading}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #2d5aa0 0%, #1e3a6f 50%, #1a2c5a 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(45, 90, 160, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {loading ? 'Ingresando...' : 'Ingresar'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard 
                className="text-white py-5" 
                style={{ 
                  width: '44%',
                  background: 'linear-gradient(135deg, #2d5aa0 0%, #1e3a6f 50%, #1a2c5a 100%)',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 25px 50px rgba(45, 90, 160, 0.3), 0 12px 24px rgba(30, 58, 111, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CCardBody className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <div>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      marginBottom: '2rem',
                      marginTop: '1rem'
                    }}>
                      Accedé a la plataforma de soporte técnico del sistema T-BOT.
                    </p>
                    <h2 className="mb-1" style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold'
                    }}>
                      MPF
                    </h2>
                    <h4 className="mb-2" style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '500'
                    }}>
                      Ministerio Público Fiscal
                    </h4>
                    <h5 className="mb-3" style={{ 
                      fontSize: '1rem', 
                      fontWeight: '400'
                    }}>
                      Tucumán
                    </h5>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
    </>
  )
}

export default Login





/*import React from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Username" autoComplete="username" />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login*/
