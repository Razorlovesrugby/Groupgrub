import SessionPage from '@/components/SessionPage'

export default function Session({ params }: { params: { code: string } }) {
  return <SessionPage code={params.code.toUpperCase()} />
}
