"use client"

import Script from 'next/script';
import { useEffect } from "react"

export default function StreamlitPage() {
  useEffect(() => {
    const loadStlite = async () => {
      const { mount } = window;
      mount(
        `
import streamlit as st

name = st.text_input('Your name')
st.write("Hello,", name or "world")
`,
        document.getElementById("stlite-root")
      )
    }

    loadStlite()
  }, [])

  return (
    <div className="h-screen w-full">
      <Script
        src="https://cdn.jsdelivr.net/npm/@stlite/browser@0.76.0/build/stlite.js"
        strategy="afterInteractive" // Loads the script after the page is interactive
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@stlite/browser@0.76.0/build/style.css"
      />
      <div id="stlite-root" className="h-full w-full" />
    </div>
  )
} 