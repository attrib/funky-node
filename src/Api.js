class Api {

  base_url = process.env.REACT_APP_API_URL
  jwtToken = null

  get(path, data) {
    return this.doCall('GET', path, data)
  }

  post(path, data) {
    return this.doCall('POST', path, data)
  }

  put(path, data) {
    return this.doCall('PUT', path, data)
  }

  delete(path, data) {
    return this.doCall('DELETE', path, data)
  }

  doCall(method, path, data) {
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (this.jwtToken) {
      headers.Authorization = this.jwtToken
    }
    return fetch(this.base_url + path, {
      method: method,
      headers: headers,
      body: JSON.stringify(data)
    }).then(results => results.json())
      .catch(reason => {
        console.error(reason)
        this.error = reason
      })
  }
}

export default new Api()