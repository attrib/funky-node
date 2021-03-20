import SessionStore from "../stores/SessionStore";

const webApiUrl = process.env.REACT_APP_BACKEND_URL;

class BackendService {

  constructor(entity) {
    this.entity = entity
    this.url = webApiUrl + entity
  }

  setAuth = async (headers) => {
    if (SessionStore.loggedIn) {
      const token = await SessionStore.getToken(authService);
      headers.append('Authorization', 'Bearer ' + token)
    }
  }

  get = async (urlParams = {}) => {
    const options = {
      method: "GET",
      headers: new Headers(),
    }
    await this.setAuth(options.headers)
    urlParams = new URLSearchParams(Object.entries(urlParams));
    const request = new Request(this.url + "?" + urlParams, options);
    const response = await fetch(request);
    return this.handleResponse(response)
  }

  getId = async (id) => {
    const options = {
      method: "GET",
      headers: new Headers(),
    }
    await this.setAuth(options.headers)
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    return this.handleResponse(response)
  }

  post = async (model) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    await this.setAuth(headers)
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url, options);
    const response = await fetch(request);
    return this.handleResponse(response)
  }

  patch = async (id, model) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json");
    await this.setAuth(headers)
    let options = {
      method: "PATCH",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    return this.handleResponse(response)
  }

  delete = async (id) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    await this.setAuth(headers)
    const options = {
      method: "DELETE",
      headers
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    return this.handleResponse(response)
  }

  handleResponse = (response) => {
    if (response.status === 200) {
      return response.json();
    }
    return response.text()
      .then((error) => {
        try {
          error = JSON.parse(error)
        }
        catch (e) {}
        if (error.error) {
          throw new Error(error.error.message || error.error)
        }
        else {
          throw new Error(error)
        }
      })
  }

}

export default BackendService

const authService = new BackendService('auth');
authService.setAuth = async (headers) => {
  if (SessionStore.loggedIn) {
    const token = SessionStore.token;
    headers.append('Authorization', 'Bearer ' + token)
  }
}
authService.login = (username, password) => {
  return authService.post({username, password})
    .then((result) => {
      SessionStore.login(result)
    })
}
export { authService }