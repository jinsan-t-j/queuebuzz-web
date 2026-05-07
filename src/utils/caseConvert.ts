export function toSnakeCase(str: string): string {
  return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function toCamelCase(str: string): string {
  return str.replaceAll(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

export function keysToSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v))
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const typedObj = obj as Record<string, unknown>
    return Object.keys(typedObj).reduce(
      (result, key) => {
        return {
          ...result,
          [toSnakeCase(key)]: keysToSnakeCase(typedObj[key]),
        }
      },
      {} as Record<string, unknown>,
    )
  }
  return obj
}

export function keysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v))
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const typedObj = obj as Record<string, unknown>
    return Object.keys(typedObj).reduce(
      (result, key) => {
        return {
          ...result,
          [toCamelCase(key)]: keysToCamelCase(typedObj[key]),
        }
      },
      {} as Record<string, unknown>,
    )
  }
  return obj
}
