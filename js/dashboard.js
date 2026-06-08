// Dashboard Controllers (Admin & Customer)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial UI setup
    setupMobileNav();
    loadSessionDetails();
    setupTabSwitching();
});

// Setup responsive mobile navigation
function setupMobileNav() {
    const navToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (navToggle && sidebar) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Close sidebar if clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== navToggle) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Load session details and display user ID in footer
function loadSessionDetails() {
    const session = getSession();
    if (!session) return;

    // Display user ID or email in footer
    const userIdEl = document.getElementById('sidebarUserId');
    if (userIdEl) {
        userIdEl.textContent = session.userId;
    }

    // Display user initials in avatar
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl && session.username) {
        userAvatarEl.textContent = session.username.substring(0, 2).toUpperCase();
    }

    const userNameEl = document.getElementById('sidebarUserName');
    if (userNameEl) {
        userNameEl.textContent = session.username;
    }

    // Welcome greeting header
    const welcomeHeaderEl = document.getElementById('welcomeHeader');
    if (welcomeHeaderEl) {
        welcomeHeaderEl.textContent = `Welcome Back, ${session.username}!`;
    }

    // Display current date in badge
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Setup dynamic view shifting (toggling between menu items)
function setupTabSwitching() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSectionId = item.getAttribute('data-section');
            if (!targetSectionId) return;

            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Hide all sections
            sections.forEach(sec => sec.classList.remove('active'));
            // Show target section
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Trigger animations for charts/tables if opening Reports section
                if (targetSectionId === 'reports-section') {
                    animateCharts();
                }
            }

            // Close mobile sidebar if open
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('active');
        });
    });
}

// -------------------------------------------------------------
// CUSTOMER DASHBOARD SPECIFIC FUNCTIONS
// -------------------------------------------------------------

let customerData = {
    balance: 24590.80,
    creditLimit: 50000.00,
    cardNumber: '4532 •••• •••• 9821',
    cardName: 'Alex Mercer',
    cardExpiry: '12/29',
    transactions: [
        { id: 'TXN1029', desc: 'Amazon Global Store', category: 'Shopping', amount: -128.50, date: '2026-06-07', status: 'Success' },
        { id: 'TXN1028', desc: 'Payroll Direct Deposit', category: 'Salary', amount: 4800.00, date: '2026-06-01', status: 'Success' },
        { id: 'TXN1027', desc: 'Starbucks Coffee Cafe', category: 'Dining', amount: -12.40, date: '2026-05-30', status: 'Success' },
        { id: 'TXN1026', desc: 'Electric Power Grid Bill', category: 'Utilities', amount: -85.20, date: '2026-05-28', status: 'Success' },
        { id: 'TXN1025', desc: 'Vanguard Invest Fund Transfer', category: 'Investment', amount: -500.00, date: '2026-05-25', status: 'Success' }
    ]
};

// Initialize Customer dashboard views
function initCustomerDashboard() {
    // Check local storage for persistent customer state
    const savedData = localStorage.getItem('customer_mock_data');
    if (savedData) {
        customerData = JSON.parse(savedData);
    } else {
        localStorage.setItem('customer_mock_data', JSON.stringify(customerData));
    }
    
    // Set customer name based on session
    const session = getSession();
    if (session) {
        customerData.cardName = session.username;
    }

    renderCustomerOverview();
    renderTransactionsTable();
    setupCardFlipper();
    setupTransferForm();
}

function renderCustomerOverview() {
    // Balances
    const balEl = document.getElementById('accountBalance');
    const balCardEl = document.getElementById('cardBalance');
    if (balEl) balEl.textContent = `$${customerData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (balCardEl) balCardEl.textContent = `$${customerData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Limit override / limits
    const limitEl = document.getElementById('creditLimit');
    if (limitEl) limitEl.textContent = `$${customerData.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Debit Card fields
    const cardNumEl = document.getElementById('cardDisplayNumber');
    const cardNameEl = document.getElementById('cardDisplayName');
    const cardExpiryEl = document.getElementById('cardDisplayExpiry');
    
    if (cardNumEl) cardNumEl.textContent = customerData.cardNumber;
    if (cardNameEl) cardNameEl.textContent = customerData.cardName;
    if (cardExpiryEl) cardExpiryEl.textContent = customerData.cardExpiry;
}

function renderTransactionsTable() {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    customerData.transactions.forEach(txn => {
        const tr = document.createElement('tr');
        
        // Amount color formatting
        const isIncome = txn.amount > 0;
        const amtText = `${isIncome ? '+' : ''}$${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        const amtClass = isIncome ? 'trend-up' : 'text-primary';
        
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${txn.desc}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${txn.id}</div>
            </td>
            <td><span style="font-size: 13px; font-weight: 500;">${txn.category}</span></td>
            <td><span style="font-size: 13px;">${txn.date}</span></td>
            <td><span class="status-badge success">Success</span></td>
            <td><span style="font-weight: 600;" class="${amtClass}">${amtText}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

function setupCardFlipper() {
    const card = document.getElementById('interactiveCard');
    if (card) {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    }
}

function setupTransferForm() {
    const form = document.getElementById('moneyTransferForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const recipient = document.getElementById('transferRecipient').value.trim();
        const bank = document.getElementById('transferBank').value;
        const acNum = document.getElementById('transferAccount').value.trim();
        const amt = parseFloat(document.getElementById('transferAmount').value);

        if (!recipient || !acNum || isNaN(amt) || amt <= 0) {
            showToast('Please fill out all fields with valid information.', 'error');
            return;
        }

        if (amt > customerData.balance) {
            showToast('Insufficient funds for this transaction.', 'error');
            return;
        }

        // Process dummy transfer
        customerData.balance -= amt;
        
        // Append new transaction to the start of history
        const newTxn = {
            id: 'TXN' + Math.floor(1000 + Math.random() * 9000),
            desc: `Transfer to ${recipient} (${bank})`,
            category: 'Transfer',
            amount: -amt,
            date: new Date().toISOString().split('T')[0],
            status: 'Success'
        };
        
        customerData.transactions.unshift(newTxn);
        
        // Keep history to 8 items max
        if (customerData.transactions.length > 8) {
            customerData.transactions.pop();
        }

        // Save back to local storage
        localStorage.setItem('customer_mock_data', JSON.stringify(customerData));

        // Update states directly without overlay popups
        form.reset();
        
        // Re-render UI dashboard details
        renderCustomerOverview();
        renderTransactionsTable();
        
        // Swap view back to "My Accounts" tab
        const accountsTab = document.querySelector('[data-section="accounts-section"]');
        if (accountsTab) accountsTab.click();
    });
}

// -------------------------------------------------------------
// ADMIN DASHBOARD SPECIFIC FUNCTIONS
// -------------------------------------------------------------

let adminData = {
    pendingAccounts: [
        { id: 'USR9870', name: 'Sophia Sterling', email: 'sophia@email.com', type: 'Customer', date: '2026-06-08', status: 'Pending' },
        { id: 'USR9868', name: 'Marcus Vane', email: 'marcus.v@email.com', type: 'Customer', date: '2026-06-07', status: 'Pending' }
    ],
    supportTickets: [
        { id: 'TKT-245', user: 'jack@gmail.com', subject: 'Card transaction duplicate charge', priority: 'High', date: '2026-06-08', status: 'Open' },
        { id: 'TKT-244', user: 'emma@yahoo.com', subject: 'Password reset code not received', priority: 'Medium', date: '2026-06-07', status: 'Open' },
        { id: 'TKT-243', user: 'sam@outlook.com', subject: 'Account statement download issue', priority: 'Low', date: '2026-06-06', status: 'Resolved' }
    ],
    employees: [
        { id: 'EMP001', name: 'Diana Prince', email: 'diana.p@stackly.com', role: 'Security Admin', status: 'Active' },
        { id: 'EMP002', name: 'Bruce Wayne', email: 'bruce.w@stackly.com', role: 'Compliance Officer', status: 'Active' },
        { id: 'EMP003', name: 'Clark Kent', email: 'clark.k@stackly.com', role: 'Support Agent', status: 'Active' }
    ]
};

// Initialize Admin dashboard views
function initAdminDashboard() {
    // Check local storage for persistent admin state
    const savedData = localStorage.getItem('admin_mock_data');
    if (savedData) {
        adminData = JSON.parse(savedData);
    } else {
        localStorage.setItem('admin_mock_data', JSON.stringify(adminData));
    }

    renderAdminOverview();
    renderPendingAccountsTable();
    renderTicketsTable();
    renderEmployeesTable();
    setupTicketActions();
    setupEmployeeActions();
}

function renderAdminOverview() {
    const pendingCountEl = document.getElementById('adminPendingCount');
    const openTicketsEl = document.getElementById('adminOpenTickets');
    const employeeCountEl = document.getElementById('adminEmployeeCount');

    // Count states
    const openTicketsCount = adminData.supportTickets.filter(t => t.status === 'Open').length;
    const pendingAccCount = adminData.pendingAccounts.filter(a => a.status === 'Pending').length;

    if (pendingCountEl) pendingCountEl.textContent = pendingAccCount;
    if (openTicketsEl) openTicketsEl.textContent = openTicketsCount;
    if (employeeCountEl) employeeCountEl.textContent = adminData.employees.length;
}

function renderPendingAccountsTable() {
    const tableBody = document.getElementById('pendingAccountsBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (adminData.pendingAccounts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No pending account verifications.</td></tr>`;
        return;
    }

    adminData.pendingAccounts.forEach((acc, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${acc.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${acc.id}</div>
            </td>
            <td><span style="font-size: 13px;">${acc.email}</span></td>
            <td><span style="font-size: 13px; font-weight: 500;">${acc.type}</span></td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
                <button class="btn-action-icon" title="Approve Account" onclick="approveAccount(${idx})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </button>
                <button class="btn-action-icon" title="Reject Account" onclick="rejectAccount(${idx})" style="margin-left: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--danger);"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function approveAccount(idx) {
    const approved = adminData.pendingAccounts[idx];
    showToast(`Account for ${approved.name} approved!`, 'success');
    
    // Remove from pending accounts
    adminData.pendingAccounts.splice(idx, 1);
    
    // Save to localStorage
    localStorage.setItem('admin_mock_data', JSON.stringify(adminData));
    
    // Refresh tables
    renderAdminOverview();
    renderPendingAccountsTable();
}

function rejectAccount(idx) {
    const rejected = adminData.pendingAccounts[idx];
    showToast(`Account request for ${rejected.name} rejected.`, 'error');
    
    adminData.pendingAccounts.splice(idx, 1);
    localStorage.setItem('admin_mock_data', JSON.stringify(adminData));
    
    renderAdminOverview();
    renderPendingAccountsTable();
}

function renderTicketsTable() {
    const tableBody = document.getElementById('supportTicketsBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    adminData.supportTickets.forEach(tkt => {
        const tr = document.createElement('tr');
        
        // Priority styling
        let prioStyle = 'color: var(--text-muted)';
        if (tkt.priority === 'High') prioStyle = 'color: var(--danger); font-weight:600;';
        if (tkt.priority === 'Medium') prioStyle = 'color: var(--warning); font-weight:600;';
        
        const isResolved = tkt.status === 'Resolved';
        const badgeClass = isResolved ? 'status-badge success' : 'status-badge pending';
        
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${tkt.id}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${tkt.date}</div>
            </td>
            <td>
                <div style="font-weight: 500; font-size: 14px;">${tkt.subject}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${tkt.user}</div>
            </td>
            <td><span style="font-size: 13px; ${prioStyle}">${tkt.priority}</span></td>
            <td><span class="${badgeClass}">${tkt.status}</span></td>
            <td>
                ${!isResolved ? `
                <button class="btn-action-icon" title="Reply Ticket" onclick="openReplyModal('${tkt.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>` : `<span style="font-size:12px; color:var(--text-muted);">Handled</span>`}
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

let activeTicketId = null;

function openReplyModal(ticketId) {
    activeTicketId = ticketId;
    const modal = document.getElementById('replyModal');
    const title = document.getElementById('replyModalTitle');
    
    if (modal && title) {
        title.textContent = `Reply to Ticket: ${ticketId}`;
        modal.classList.add('active');
        document.getElementById('ticketReplyText').focus();
    }
}

function setupTicketActions() {
    const modal = document.getElementById('replyModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('ticketReplyForm');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const replyText = document.getElementById('ticketReplyText').value.trim();
            if (!replyText) return;

            // Update ticket status in data
            const ticket = adminData.supportTickets.find(t => t.id === activeTicketId);
            if (ticket) {
                ticket.status = 'Resolved';
                localStorage.setItem('admin_mock_data', JSON.stringify(adminData));
                
                showToast(`Reply sent. Ticket ${activeTicketId} marked as Resolved.`, 'success');
                
                modal.classList.remove('active');
                form.reset();
                
                renderAdminOverview();
                renderTicketsTable();
            }
        });
    }
}

function renderEmployeesTable() {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    adminData.employees.forEach((emp, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600; color: var(--text-primary);">${emp.name}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${emp.id}</div>
            </td>
            <td><span style="font-size: 13px;">${emp.email}</span></td>
            <td><span style="font-size: 13px; font-weight: 500;">${emp.role}</span></td>
            <td><span class="status-badge success">${emp.status}</span></td>
            <td>
                <button class="btn-action-icon" title="Remove Employee" onclick="deleteEmployee(${idx})" style="color:var(--danger);">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function deleteEmployee(idx) {
    const emp = adminData.employees[idx];
    if (confirm(`Are you sure you want to remove employee ${emp.name}?`)) {
        adminData.employees.splice(idx, 1);
        localStorage.setItem('admin_mock_data', JSON.stringify(adminData));
        
        showToast(`Employee ${emp.name} removed.`, 'success');
        
        renderAdminOverview();
        renderEmployeesTable();
    }
}

function setupEmployeeActions() {
    const form = document.getElementById('addEmployeeForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('empName').value.trim();
        const email = document.getElementById('empEmail').value.trim();
        const role = document.getElementById('empRole').value;

        if (!name || !email) {
            showToast('Please enter employee details.', 'error');
            return;
        }

        const newEmp = {
            id: 'EMP' + String(adminData.employees.length + 1).padStart(3, '0'),
            name,
            email,
            role,
            status: 'Active'
        };

        adminData.employees.push(newEmp);
        localStorage.setItem('admin_mock_data', JSON.stringify(adminData));

        showToast(`Employee ${name} successfully added!`, 'success');
        form.reset();

        renderAdminOverview();
        renderEmployeesTable();
    });
}

// Reports page SVG bar graph animation
function animateCharts() {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach(bar => {
        const height = bar.getAttribute('data-height');
        // Reset height
        bar.style.height = '0%';
        // Animate growth with slight delay
        setTimeout(() => {
            bar.style.height = height;
        }, 150);
    });
}
