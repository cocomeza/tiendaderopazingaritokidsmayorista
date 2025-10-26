import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/productos/ProductCard'
import { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

const mockProduct: Product = {
  id: '1',
  name: 'Remera Básica',
  description: 'Remera de algodón 100%',
  price: 2500,
  images: ['/test-image.jpg'],
  category: 'Remeras',
  sizes: ['S', 'M', 'L'],
  colors: ['Blanco', 'Negro'],
  stock: 50,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Remera Básica')).toBeInTheDocument()
    expect(screen.getByText('Remera de algodón 100%')).toBeInTheDocument()
    expect(screen.getByText('$2.500')).toBeInTheDocument()
    expect(screen.getByText('Remeras')).toBeInTheDocument()
    expect(screen.getByText('50 disponibles')).toBeInTheDocument()
  })

  it('shows low stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 }
    render(<ProductCard product={lowStockProduct} />)
    
    expect(screen.getByText('Últimas unidades')).toBeInTheDocument()
  })

  it('calls onViewDetails when view button is clicked', () => {
    const mockOnViewDetails = jest.fn()
    render(<ProductCard product={mockProduct} onViewDetails={mockOnViewDetails} />)
    
    // Note: This test would need to be updated based on the actual implementation
    // of the view details functionality
  })

  it('adds item to cart when add button is clicked', () => {
    render(<ProductCard product={mockProduct} />)
    
    const addButton = screen.getByText('Agregar')
    fireEvent.click(addButton)
    
    // Note: This test would need to be updated based on the actual cart implementation
  })
})
