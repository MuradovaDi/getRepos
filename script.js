"use strict";

// DOM variables
const container = document.querySelector(".searchContainer");
const searchUserInput = document.querySelector(".searchUser");
const profile = document.querySelector(".profile");
const reposList = document.createElement('ul');

class API {
  clientId = "69f46c9a9737d86a04af";
  clientSecret = "9bb4d42003a86ec1fec9bee1fb390549b1d26e02";

  async getUser(userName) {
    const response = await fetch(`https://api.github.com/users/${userName}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  }

  async getRepos(userName){
    const response = await fetch(`https://api.github.com/users/${userName}/repos?per_page=5&sort=created`, {
        method: "GET",
        headers: {
            Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
        }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  }
}

class UI {
  showRepos(repos){
    reposList.innerHTML = "";
    let newRepos = repos.slice(0,5);
    newRepos.forEach((item) => {
      const reposItem = document.createElement('li');
      reposItem.innerHTML = `<li>Name: ${item.name}<br> 
      Date:${item.created_at}<br> 
      Link: ${item.git_url}</li>`;
      reposList.appendChild(reposItem); 
    })
    profile.after(reposList);
  }

  showProfile(user, repos) {
    profile.innerHTML = `
    <div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3">
            <img class="img-fluid mb-2" src="${user.avatar_url}">
            <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
            <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
            <span class="badge badge-success">Followers: ${user.followers}</span>
            <span class="badge badge-info">Following: ${user.following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${user.company}</li>
              <li class="list-group-item">Website/Blog: ${user.blog}</li>
              <li class="list-group-item">Location: ${user.location}</li>
              <li class="list-group-item">Member Since: ${user.created_at}</li>
            </ul>
          </div>
        </div>
      </div>
      <h3 class="page-heading mb-3">Latest Repos</h3>
    `;

    this.showRepos(repos);
  }

  clearProfile() {
    profile.innerHTML = "";
    reposList.innerHTML = "";
  }

  showAlert(message, type, timeout = 3000) {
    this.clearAlert();

    const div = document.createElement("div");
    div.className = `alert ${type}`;
    div.appendChild(document.createTextNode(message));

    const search = document.querySelector(".search");
    container.insertBefore(div, search);

    setTimeout(() => {
      this.clearAlert();
    }, timeout);
  }

  clearAlert() {
    const alertBlock = document.querySelector(".alert");
    if (alertBlock) {
      alertBlock.remove();
    }
  }
}

const handleInput = async (event) => {
  const ui = new UI();
  const userText = event.target.value.trim();

  if (!userText) {
    ui.clearProfile();
    return;
  }

  try {
    const api = new API();
    const user = await api.getUser(userText);
    const repos = await api.getRepos(userText);
    // ui.clearAlert();

    ui.showProfile(user, repos);
  } catch (error) {
    ui.showAlert(error.message, "alert-danger");
    ui.clearProfile();
  }
};

const debounce = (func, delay) => {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Event listeners
searchUserInput.addEventListener("input", debounce(handleInput, 1000));
