"use client"

import { useState } from "react"
import { ArrowLeft, User, Truck, CreditCard, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import emailjs from "@emailjs/browser"

interface CheckoutProps {
  product: any
  onBack: () => void
}

export default function Checkout({ product, onBack }: CheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPixModal, setShowPixModal] = useState(false)
  const [isGeneratingPix, setIsGeneratingPix] = useState(false)
  const [formData, setFormData] = useState({
    // Dados pessoais
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    // Dados de entrega
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })
  const [pixData, setPixData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1")
  }

  const generateOrderId = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substr(2, 5).toUpperCase()
    return `SEDUZ-${timestamp.slice(-6)}${random}`
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendOrderEmail = async (orderId: string) => {
    try {
      // Inicializar EmailJS
      emailjs.init("hIUp4sWfNrscBt-he")

      const templateParams = {
        pedido_id: orderId,
        produto_nome: product.name,
        produto_preco: `R$ ${product.price.toFixed(2).replace(".", ",")}`,
        cliente_nome: formData.fullName,
        cliente_whatsapp: formData.phone,
        cliente_cep: formData.cep,
        cliente_estado: formData.state,
        cliente_cidade: formData.city,
        cliente_numero: formData.number,
        data_pedido: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      await emailjs.send("service_f9wg6sr", "template_4ndjjvh", templateParams)
      console.log("Email enviado com sucesso!")
    } catch (error) {
      console.error("Erro ao enviar email:", error)
    }
  }

  const generatePixCode = async () => {
    setIsGeneratingPix(true)

    try {
      // Validar email antes de enviar
      if (!validateEmail(formData.email)) {
        alert("Por favor, digite um email válido.")
        setIsGeneratingPix(false)
        return
      }

      // Gerar ID do pedido
      const orderId = generateOrderId()

      console.log("Gerando PIX para:", orderId)
      console.log("Dados do formulário:", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      })

      // Criar pagamento PIX no Mercado Pago
      const response = await fetch("/api/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: product.price,
          description: product.name,
          payer: {
            name: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.replace(/\D/g, ""),
          },
          external_reference: orderId,
        }),
      })

      console.log("Status da resposta:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro na resposta:", errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Dados recebidos:", data)

      if (data.success) {
        setPixData(data)
        setShowPixModal(true)

        // Enviar email com os dados do pedido
        await sendOrderEmail(orderId)
      } else {
        console.error("Erro nos dados:", data)
        alert(`Erro ao gerar código PIX: ${data.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      alert(`Erro ao gerar código PIX: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsGeneratingPix(false)
    }
  }

  const copyPixCode = () => {
    if (pixData?.pix_qr_code) {
      navigator.clipboard.writeText(pixData.pix_qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const steps = [
    { number: 1, title: "Dados", icon: User },
    { number: 2, title: "Entrega", icon: Truck },
    { number: 3, title: "Pagamento", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Finalizar Compra</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 max-w-2xl">
        {/* Product Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-3 mb-3">
          <div className="flex items-center space-x-4">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
              <p className="text-lg font-bold text-blue-600">R$ {product.price.toFixed(2).replace(".", ",")}</p>
            </div>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span
                  className={`mt-1 text-xs font-medium text-center ${
                    currentStep >= step.number ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          {currentStep === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Dados Pessoais</h2>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="fullName" className="text-sm">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="mt-1 h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    className={`mt-1 h-10 ${formData.email && !validateEmail(formData.email) ? "border-red-500" : ""}`}
                  />
                  {formData.email && !validateEmail(formData.email) && (
                    <p className="text-red-500 text-xs mt-1">Digite um email válido</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="mt-1 h-10"
                    maxLength={15}
                  />
                </div>

                <div>
                  <Label htmlFor="cpf" className="text-sm">
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="mt-1 h-10"
                    maxLength={14}
                  />
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                size="lg"
                disabled={
                  !formData.fullName ||
                  !formData.email ||
                  !validateEmail(formData.email) ||
                  !formData.phone ||
                  !formData.cpf
                }
              >
                Ir para Entrega
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Dados de Entrega</h2>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="cep" className="text-sm">
                    CEP *
                  </Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", formatCEP(e.target.value))}
                    placeholder="00000-000"
                    className="mt-1 h-10"
                    maxLength={9}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">
                    Endereço *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Rua, Avenida..."
                    className="mt-1 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="number" className="text-sm">
                      Número *
                    </Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange("number", e.target.value)}
                      placeholder="123"
                      className="mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement" className="text-sm">
                      Complemento
                    </Label>
                    <Input
                      id="complement"
                      value={formData.complement}
                      onChange={(e) => handleInputChange("complement", e.target.value)}
                      placeholder="Apto, Casa..."
                      className="mt-1 h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="neighborhood" className="text-sm">
                    Bairro *
                  </Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="Nome do bairro"
                    className="mt-1 h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-sm">
                      Cidade *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Sua cidade"
                      className="mt-1 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm">
                      Estado *
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="mt-1 h-10"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setCurrentStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                size="lg"
                disabled={
                  !formData.cep ||
                  !formData.address ||
                  !formData.number ||
                  !formData.neighborhood ||
                  !formData.city ||
                  !formData.state
                }
              >
                Ir para Pagamento
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pagamento PIX</h2>

              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">💳</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamento via PIX</h3>
                <p className="text-gray-600 mb-6">
                  Clique no botão abaixo para gerar o código PIX e finalizar sua compra
                </p>
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    Total: R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Button
                  onClick={generatePixCode}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={isGeneratingPix}
                >
                  {isGeneratingPix ? "Gerando PIX..." : "Gerar Código PIX"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIX Modal */}
      {showPixModal && pixData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Pagamento PIX</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPixModal(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  {pixData.pix_qr_code_base64 ? (
                    <img
                      src={`data:image/png;base64,${pixData.pix_qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-32 h-32 mx-auto mb-4 border-2 border-green-600 rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white border-2 border-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">📱</span>
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-green-800 mb-2">QR Code PIX Gerado!</h4>
                  <p className="text-green-700 text-sm">Escaneie o QR Code acima ou copie o código PIX abaixo</p>
                </div>
              </div>

              {pixData.pix_qr_code && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Código PIX Copia e Cola:</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={pixData.pix_qr_code} readOnly className="font-mono text-xs bg-white" />
                    <Button onClick={copyPixCode} variant="outline" size="sm" className="shrink-0 bg-transparent">
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {copied && <p className="text-green-600 text-sm mt-2">Código copiado!</p>}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
                <ol className="text-blue-700 text-sm space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                </ol>
              </div>

              <div className="text-center border-t pt-4">
                <p className="text-gray-600 text-sm mb-2">Após o pagamento, você receberá a confirmação por e-mail</p>
                <p className="text-xl font-bold text-blue-600">
                  Total: R$ {product.price.toFixed(2).replace(".", ",")}
                </p>
              </div>

              <Button onClick={() => setShowPixModal(false)} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
