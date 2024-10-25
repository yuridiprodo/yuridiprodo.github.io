console.log("Redirect script started");

if (window.location.pathname.startsWith('/articles/')) {
    const articleName = window.location.pathname.split('/').pop().replace('.html', '');
    console.log(`Redirecting to index.html?article=${articleName}`);
    window.location.href = `index.html?article=${articleName}`;
} else if (window.location.pathname.startsWith('/pages/')) {
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    console.log(`Redirecting to index.html?pages=${pageName}`);
    window.location.href = `index.html?pages=${pageName}`;
}