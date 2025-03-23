// index.js
document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('github-form');
    let resultsDiv = document.getElementById('results');
    let searchType = 'users'; // Variable to toggle between users and repositories

    // Create a button to toggle search type
    let toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Search Repos';
    toggleBtn.style.marginLeft = '10px';
    form.appendChild(toggleBtn);

    // Event listener to toggle search type
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchType = searchType === 'users' ? 'repositories' : 'users';
        toggleBtn.textContent = searchType === 'users' ? 'Search Repos' : 'Search Users';
    });

    // Event listener for form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let search = document.getElementById('search').value.trim(); // Get the search input and trim spaces
        if (!search) {
            alert('Please enter a search term.');
            return;
        }

        resultsDiv.innerHTML = '<p>Loading...</p>'; // Show loading message

        // Determine the correct API URL based on search type
        let apiUrl = searchType === 'users'
            ? `https://api.github.com/search/users?q=${search}`
            : `https://api.github.com/search/repositories?q=${search}`;

        // Fetch data from GitHub API
        fetch(apiUrl, { 
            headers: { 
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        .then(response => response.json())
        .then(data => {
            resultsDiv.innerHTML = `
                <div id="user-results"><h2>Users</h2></div>
                <div id="repo-results"><h2>Repositories</h2></div>
            `;

            if (searchType === 'users') {
                // Display user search results
                if (data.items.length === 0) {
                    document.getElementById('user-results').innerHTML += '<p>No users found.</p>';
                    return;
                }

                data.items.forEach(user => {
                    let userDiv = document.createElement('div');
                    userDiv.innerHTML = `
                        <div>
                            <a href="${user.html_url}" target="_blank">
                                <img src="${user.avatar_url}" width="50" style="border-radius:50%;" />
                                <p>${user.login}</p>
                            </a>
                            <button data-username="${user.login}">View Repos</button>
                        </div>`;
                    document.getElementById('user-results').appendChild(userDiv);
                });

                // Attach event listeners to 'View Repos' buttons
                document.querySelectorAll('button[data-username]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        fetchUserRepos(e.target.dataset.username);
                    });
                });
            } else {
                // Display repository search results
                if (data.items.length === 0) {
                    document.getElementById('repo-results').innerHTML += '<p>No repositories found.</p>';
                    return;
                }

                data.items.forEach(repo => {
                    let repoDiv = document.createElement('div');
                    repoDiv.innerHTML = `
                        <div>
                            <a href="${repo.html_url}" target="_blank">
                                <p>${repo.full_name}</p>
                            </a>
                        </div>`;
                    document.getElementById('repo-results').appendChild(repoDiv);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p style="color: red;">Error fetching data. You may have hit the API rate limit. Try again later.</p>';
        });
    });

    // Function to fetch and display repositories for a selected user
    function fetchUserRepos(username) {
        fetch(`https://api.github.com/users/${username}/repos`)
            .then(response => response.json())
            .then(repos => {
                let repoList = `<h3>${username}'s Repositories:</h3>`;
                
                if (repos.length === 0) {
                    repoList += '<p>No repositories found.</p>';
                } else {
                    repos.forEach(repo => {
                        repoList += `<p><a href="${repo.html_url}" target="_blank">${repo.name}</a></p>`;
                    });
                }

                document.getElementById('repo-results').innerHTML = repoList; // Replace instead of append
            })
            .catch(error => {
                console.error('Error fetching repos:', error);
                document.getElementById('repo-results').innerHTML = '<p style="color: red;">Error fetching repositories.</p>';
            });
    }
});
