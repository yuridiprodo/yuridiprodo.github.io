console.log("Redirect script started");
console.log("Current pathname:", window.location.pathname);

if (window.location.pathname.startsWith('/articles/')) {
    const articleName = window.location.pathname.split('/').pop().replace('.html', '');
    console.log(`Redirecting to index.html?article=${articleName}`);
    window.location.href = `index.html?article=${articleName}`;
} else if (window.location.pathname.startsWith('/pages/')) {
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    console.log(`Redirecting to index.html?pages=${pageName}`);
    window.location.href = `index.html?pages=${pageName}`;
} else {
    console.log("Not an article or page path. No redirect.");
}

// Forza il caricamento della index se non si è già sulla index
if (window.location.pathname !== '/index.html') {
    window.location.href = 'index.html';
}