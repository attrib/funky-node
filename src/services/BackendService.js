import SessionStore from "../stores/SessionStore";

const webApiUrl = process.env.REACT_APP_BACKEND_URL;

class BackendService {

  constructor(entity) {
    this.entity = entity
    this.url = webApiUrl + entity
  }

  get = async (urlParams = {}) => {
    const options = {
      method: "GET",
    }
    if (SessionStore.loggedIn) {
      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + SessionStore.token)
      options.headers = headers
    }
    urlParams = new URLSearchParams(Object.entries(urlParams));
    const request = new Request(this.url + "?" + urlParams, options);
    const response = await fetch(request);
    if (response.status === 200) {
      return response.json();
    }
    throw new Error('Request error');
  }

  getId = async (id) => {
    const options = {
      method: "GET",
    }
    if (SessionStore.loggedIn) {
      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + SessionStore.token)
      options.headers = headers
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    if (response.status === 200) {
      return response.json();
    }
    throw new Error('Request error');
  }

  post = async (model) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (SessionStore.loggedIn) {
      headers.append('Authorization', 'Bearer ' + SessionStore.token)
    }
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url, options);
    const response = await fetch(request);
    if (response.status === 200) {
      return response.json();
    }
    else {
      return response.text()
        .then((error) => {
          throw new Error(error)
        })
    }
  }

  patch = async (id, model) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json");
    if (SessionStore.loggedIn) {
      headers.append('Authorization', 'Bearer ' + SessionStore.token)
    }
    let options = {
      method: "PATCH",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    if (response.status === 200) {
      return response.json();
    }
    else {
      return response.text()
        .then((error) => {
          throw new Error(error)
        })
    }
  }

  delete = async (id) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (SessionStore.loggedIn) {
      headers.append('Authorization', 'Bearer ' + SessionStore.token)
    }
    const options = {
      method: "DELETE",
      headers
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    if (response.status === 200) {
      return response.json();
    }
    else {
      return response.text()
        .then((error) => {
          throw new Error(error)
        })
    }
  }

}

export default BackendService

const authService = new BackendService('auth');
authService.login = (username, password) => {
  return authService.post({username, password})
    .then((result) => {
      SessionStore.login(result)
    })
}
export { authService }