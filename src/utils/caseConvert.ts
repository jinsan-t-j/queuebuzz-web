export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())
}

export function keysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnakeCase(v))
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      return {
        ...result,
        [toSnakeCase(key)]: keysToSnakeCase(obj[key]),
      }
    }, {} as any)
  }
  return obj
}

export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamelCase(v))
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      return {
        ...result,
        [toCamelCase(key)]: keysToCamelCase(obj[key]),
      }
    }, {} as any)
  }
  return obj
}
