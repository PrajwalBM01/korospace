"use server"

import { AddApiKeyType, RemoveApiKeyType } from "@/types/keySchema"

export async function setApiKey(data: AddApiKeyType) {
  console.log(data)
}

export async function removeApiKey(data: RemoveApiKeyType) {
  console.log(data)
}
