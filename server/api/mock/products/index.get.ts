import { getMockProductList } from '../../../utils/mockStoreData'

export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'success',
    data: getMockProductList()
  }
})
