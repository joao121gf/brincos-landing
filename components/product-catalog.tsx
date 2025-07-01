"use client"

import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const products = [
  {
    id: 1,
    name: "Brinco Pérola Clássicos",
    price: 9.9,
    originalPrice: 39.9,
    image: "/brinco.jpg?height=300&width=300",
    rating: 4.9,
    reviews: 80,
    description: "Elegante brinco com pérola natural, perfeito para ocasiões especiais.",
  },
  {
    id: 2,
    name: "Colar Choker Dourado",
    price: 9.9,
    originalPrice: 39.9,
    image: "/brinco5.jpg?height=300&width=300",
    rating: 4.9,
    reviews: 80,
    description: "Colar Choker Dourado Elegante",
  },
  {
    id: 3,
    name: "Brinco Cristal Swarovski",
    price: 9.9,
    originalPrice: 39.9,
    image: "/brinco3.jpg?height=300&width=300",
    rating: 4.9,
    reviews: 80,
    description: "Conjunto de Brincos Borboleta com Strass",
  },
  {
    id: 4,
    name: "Brinco Gota Elegante",
    price: 9.9,
    originalPrice: 49.9,
    image: "/brinco4.jpg?height=300&width=300",
    rating: 4.9,
    reviews: 80,
    description: "Brincos de Argola Geométricos Vintage",
  },
]

interface ProductCatalogProps {
  onBuyProduct: (product: any) => void
}

export default function ProductCatalog({ onBuyProduct }: ProductCatalogProps) {
  return (
    <main className="container mx-auto px-4 py-4">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Coleção Exclusiva de Brincos</h2>
        <p className="text-sm md:text-base text-gray-600">
          Brincos elegantes com até 40% de desconto. Entrega rápida garantida.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto" id="produtos">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3 md:p-4">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <span className="text-xs md:text-sm text-gray-600 mb-3 block">4.9 (80 avaliações)</span>

              {/* Price */}
              <div className="mb-3">
                <div className="text-lg md:text-xl font-bold text-blue-600 mb-1">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </div>
                <div className="text-sm md:text-base text-gray-500 line-through">
                  R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                </div>
              </div>

              {/* Buy Button */}
              <Button
                onClick={() => onBuyProduct(product)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 md:py-2.5 rounded-lg transition-colors duration-200 text-xs md:text-sm"
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Comprar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h4 className="font-semibold text-gray-900">Entrega Garantida</h4>
            <p className="text-sm text-gray-600">Receba em até 7 dias úteis</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-600 text-xl">🔒</span>
            </div>
            <h4 className="font-semibold text-gray-900">Pagamento Seguro</h4>
            <p className="text-sm text-gray-600">PIX instantâneo e seguro</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-600 text-xl">⭐</span>
            </div>
            <h4 className="font-semibold text-gray-900">Qualidade Premium</h4>
            <p className="text-sm text-gray-600">Materiais de alta qualidade</p>
          </div>
        </div>
      </div>
    </main>
  )
}
