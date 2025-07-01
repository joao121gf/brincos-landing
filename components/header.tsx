"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Hambúrguer */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>

          {/* Logo */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-blue-600">✨ Brincos Elegantes</h1>
          </div>

          {/* Espaço para balancear o layout */}
          <div className="w-10"></div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-2 pt-4">
              <a
                href="#produtos"
                className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Produtos
              </a>
              <a
                href="#sobre"
                className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sobre
              </a>
              <a
                href="#contato"
                className="text-gray-700 hover:text-blue-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contato
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
