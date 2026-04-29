import { buildRegionListPayload } from '../../../utils/mockCharacterRegions'

export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'success',
    data: buildRegionListPayload()
  }
})
