import React from 'react'

const DocsLink = ({ children, href }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export default DocsLink
