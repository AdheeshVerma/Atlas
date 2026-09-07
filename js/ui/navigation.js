// Navigation and tab management

// Setup click listeners for navigation tabs
export function setupNavigation(onViewChange) {
    const buttons = document.querySelectorAll('.nav-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.dataset.view;
            showView(targetView);
            if (typeof onViewChange === 'function') {
                onViewChange(targetView);
            }
        });
    });
}

// Switch visible view
export function showView(viewName) {
    const views = document.querySelectorAll('.app-view');
    const buttons = document.querySelectorAll('.nav-btn');

    views.forEach(view => {
        view.hidden = view.dataset.viewContent !== viewName;
    });

    buttons.forEach(button => {
        button.classList.toggle(
            'active',
            button.dataset.view === viewName
        );
    });
}

// Update the duplicate count badge on the navigation tab
export function updateDuplicatesBadge(count) {
    const badge = document.getElementById('nav-duplicates-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.hidden = false;
    } else {
        badge.hidden = true;
    }
}
