export function createStore<S extends Record<string, any>>(initialStore?: S) {
  const store = new Proxy((initialStore || {}) as S, {
    get(target, p) {
      if (typeof p !== 'string') {
        return undefined
      }
      const path = p.split('.')
      let cur: any = target
      for (const key of path) {
        cur = cur?.[key]
        if (cur === undefined) {
          return undefined
        }
      }
      return cur
    },
    set(target, p, newValue) {
      if (typeof p !== 'string') {
        return false
      }
      const path = p.split('.')
      let cur: any = target
      for (let i = 0; i < path.length; i++) {
        const key = path[i]
        if (i === path.length - 1) {
          cur[key] = newValue
          return true
        }
        else {
          cur = cur?.[key]
          if (cur === undefined) {
            return false
          }
        }
      }
      return cur
    },

  })
  return store
}
