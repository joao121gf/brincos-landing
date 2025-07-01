"use client"

import { useState } from "react"
import Header from "@/components/header"
import ProductCatalog from "@/components/product-catalog"
import Checkout from "@/components/checkout"
import Footer from "@/components/footer"

export default function Home() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleBuyProduct = (product: any) => {
    setSelectedProduct(product)
    setShowCheckout(true)
  }

  const handleBackToCatalog = () => {
    setShowCheckout(false)
    setSelectedProduct(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {!showCheckout ? (
        <>
          <ProductCatalog onBuyProduct={handleBuyProduct} />
          <Footer />
        </>
      ) : (
        <Checkout product={selectedProduct} onBack={handleBackToCatalog} />
      )}
    </div>
  )
}
