document.getElementById('loadingSpinner').style.display = 'block';
// After data is loaded:
document.getElementById('loadingSpinner').style.display = 'none';
document.getElementById('leaderboardTable').style.display = 'table';
function showNotification(message) {
    const notification = document.getElementById('inviteNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000); // Hide after 3 seconds
}
