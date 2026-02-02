
import React from 'react'

const PrimaryBtn = ({ children, type, className }) => {
    return (
        <div>

            <button type={type} className={`${className}`}>{children}</button>

        </div>
    )
}

export default PrimaryBtn
