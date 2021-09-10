// 封装 cookie
export function setCookie(key, value, { expires, path = '/', domain, secure }) {
  if (typeof document === 'undefined') return

  // 缓存时间转为日期对象
  if (typeof expires === 'number') {
    // expires = new Date(new Date().getTime() + expires * 1000 * 60 * 60) // 单位小时
    // expires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24) // 单位天
    expires = new Date(Date.now() + expires * 864e5) // 单位天
  }

  document.cookie =
    key + '=' + escape(value) +
    (expires ? '; expires=' + expires.toUTCString() : '') +
    (path ? '; path=' + path : '') +
    (domain ? '; domain=' + domain : '') +
    (secure ? '; secure' : '')

  return true
}

export function getCookie(key) {
  if (typeof document === 'undefined') return
  let arr = document.cookie.match(new RegExp('(^| )' + key + '=([^;]*)(;|$)'))
  return arr ? unescape(arr[2]) : ''
}

export function removeCookie(key, opts) {
  return setCookie(key, '', { ...opts, expires: -1 })
}

export function cookie(key, value, opts = {}) {
  if (typeof value === 'undefined') {
    return getCookie(key)
  } else if (value === null || value === '') {
    return removeCookie(key, opts)
  } else {
    return setCookie(key, value, opts)
  }
}

cookie.set = setCookie
cookie.get = getCookie
cookie.remove = removeCookie
