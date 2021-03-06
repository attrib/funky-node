const webApiUrl = 'http://localhost:3000/'

class BackendService {

  constructor(entity) {
    this.entity = entity
    this.url = webApiUrl + entity
  }

  get = async (urlParams) => {
    const options = {
      method: "GET",
    }
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
    let options = {
      method: "POST",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url, options);
    const response = await fetch(request);
    return response;
  }

  put = async (model) => {
    const headers = new Headers()
    headers.append("Content-Type", "application/json");
    let options = {
      method: "PUT",
      headers,
      body: JSON.stringify(model)
    }
    const request = new Request(this.url, options);
    const response = await fetch(request);
    return response;
  }

  delete = async (id) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const options = {
      method: "DELETE",
      headers
    }
    const request = new Request(this.url + "/" + id, options);
    const response = await fetch(request);
    return response;
  }

}

export default BackendService