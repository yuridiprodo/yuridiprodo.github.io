const articlesDiv = document.getElementById('articles');

async function fetchArticles() {
    const response = await fetch('https://api.github.com/repos/tuo-username/tuo-repository/contents/articles');
    const articles = await response.json();

    const sortedArticles = articles.sort((a, b) => new Date(b.name) - new Date(a.name));

    sortedArticles.forEach(article => {
        const link = document.createElement('a');
        link.href = `articles/${article.name}`;
        link.innerText = article.name.replace('.md', '');
        
        const title = document.createElement('h1');
        title.appendChild(link);

        articlesDiv.appendChild(title);
    });
}

fetchArticles();
