// ============================================================
// LeadPulse CRM — Team Management Page
// Agent assignment and activity tracking
// ============================================================

window.LP = window.LP || {};
LP.pages = LP.pages || {};

LP.pages.team = (() => {
  let selectedAgentId = null;

  function timeAgo(isoStr) {
    if (!isoStr) return '';
    const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  function getAgentLeads(agentId) {
    return LP.data.leads.filter(l => l.assignedTo === agentId);
  }

  function getAgentActivities(agentId) {
    const leads = getAgentLeads(agentId);
    let activities = [];
    leads.forEach(lead => {
      if (lead.activities && lead.activities.length) {
        lead.activities.forEach(a => {
          activities.push({
            ...a,
            leadName: lead.name,
            leadId: lead.id
          });
        });
      }
    });
    return activities.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }

  function renderAgentsList() {
    return LP.data.agents.map(a => {
      const isSelected = a.id === selectedAgentId;
      const count = getAgentLeads(a.id).length;
      return `
        <div class="agent-card ${isSelected ? 'active' : ''}" data-id="${a.id}" style="padding:12px;border:1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'};border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:12px;background:${isSelected ? 'rgba(6,182,212,0.05)' : '#fff'}">
          <img src="${a.avatar}" alt="${a.name}" style="width:40px;height:40px;border-radius:50%">
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${a.name}</div>
            <div style="font-size:12px;color:var(--text-3)">${count} assigned lead${count !== 1 ? 's' : ''}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderActivitiesList(activities) {
    if (activities.length === 0) {
      return `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px">No activities found for this agent's leads.</div>`;
    }
    return activities.map(a => `
      <div style="display:flex;gap:12px;margin-bottom:16px;font-size:13px">
        <div style="margin-top:2px;color:var(--primary)">${a.type === 'note' ? '📝' : (a.type === 'status' ? '🔄' : '👤')}</div>
        <div style="flex:1">
          <div style="margin-bottom:4px">
            <strong style="color:var(--text-1)">${a.user}</strong> 
            <span style="color:var(--text-2)">on lead</span> 
            <a href="#leads" onclick="event.preventDefault();LP.drawer.open(LP.data.leads.find(l=>l.id==='${a.leadId}'))" style="color:var(--primary);text-decoration:none;font-weight:500">${a.leadName}</a>
          </div>
          <div style="color:var(--text-2);background:#f9fafb;padding:8px 12px;border-radius:6px;border:1px solid var(--border)">
            ${a.text}
          </div>
          <div style="margin-top:4px;font-size:11px;color:var(--text-3)">${timeAgo(a.ts)}</div>
        </div>
      </div>
    `).join('');
  }

  function renderLeadsList(leads) {
    if (leads.length === 0) {
      return `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px">No leads assigned.</div>`;
    }
    return `
      <table class="data-table" style="margin-top:0">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(l => `
            <tr class="lead-row" data-lead-id="${l.id}" style="cursor:pointer">
              <td>
                <div style="font-weight:500;color:var(--text-1)">${l.name}</div>
                <div style="font-size:11px;color:var(--text-3)">${l.phone}</div>
              </td>
              <td><span class="badge" style="background:#f1f5f9;color:#475569">${l.status}</span></td>
              <td style="color:var(--text-3)">${timeAgo(l.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function render() {
    if (!selectedAgentId && LP.data.agents.length > 0) {
      selectedAgentId = LP.data.agents[0].id;
    }

    const agent = LP.data.agents.find(a => a.id === selectedAgentId);
    let rightPanel = '';
    
    if (agent) {
      const leads = getAgentLeads(agent.id);
      const activities = getAgentActivities(agent.id);
      rightPanel = `
        <div style="display:flex;gap:24px;align-items:flex-start">
          <!-- Leads List -->
          <div class="card" style="flex:1">
            <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600">Assigned Leads</div>
            <div style="padding:0">
              ${renderLeadsList(leads)}
            </div>
          </div>
          <!-- Activity Timeline -->
          <div class="card" style="flex:1">
            <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600">Recent Activities</div>
            <div style="padding:16px;max-height:500px;overflow-y:auto">
              ${renderActivitiesList(activities)}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Team Management</h1>
          <div class="page-subtitle">Assign leads to agents and track their activities</div>
        </div>
      </div>
      <div style="display:flex;gap:24px;align-items:flex-start">
        <div style="width:280px;flex-shrink:0">
          <div class="card" style="padding:16px">
            <h3 style="margin:0 0 16px 0;font-size:14px;color:var(--text-2)">Agents</h3>
            <div id="agents-list">
              ${renderAgentsList()}
            </div>
          </div>
        </div>
        <div style="flex:1" id="agent-details">
          ${rightPanel}
        </div>
      </div>
    `;
  }

  function init(container) {
    container.innerHTML = render();
    container.classList.add('fade-in');

    // Agent selection
    container.querySelectorAll('.agent-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedAgentId = card.dataset.id;
        init(container); // Re-render whole page
      });
    });

    // Lead click
    container.querySelectorAll('.lead-row').forEach(row => {
      row.addEventListener('click', () => {
        const lead = LP.data.leads.find(l => l.id === row.dataset.leadId);
        if (lead) LP.drawer.open(lead);
      });
    });
  }

  return { render, init, destroy: () => {} };
})();
