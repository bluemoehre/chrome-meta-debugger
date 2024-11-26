import { Meta } from 'types/Meta'

type DataMessage = {
  type: 'data'
  data: Meta
}
type ErrorMessage = {
  type: 'error'
  error: string
}

type RefreshMessage = {
  type: 'refresh'
}

export type Message = DataMessage | ErrorMessage | RefreshMessage
