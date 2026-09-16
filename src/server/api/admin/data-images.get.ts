import { listDataImages } from '~/server/utils/dataImages'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  return { images: await listDataImages() }
})
