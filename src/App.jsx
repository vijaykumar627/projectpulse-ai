import React, { useMemo, useRef, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Download,
  FileText, Filter, Flag, Gauge, LayoutDashboard, ListChecks, Menu, Plus,
  Search, Settings2, ShieldCheck, Sparkles, Target, Upload, Users, X,
  Clock3, CheckCircle2, CircleDot, MoreHorizontal, RefreshCw
} from 'lucide-react';

const seedProjects = [
  { id:'PP-101', name:'Student Success Portal', owner:'Maya Chen', team:'Digital Experience', start:'2026-10-01', due:'2026-11-06', status:'In progress', progress:68, budget:18000, spent:11600, priority:'High', notes:'Waiting for final accessibility review.', dependencies:'Design sign-off', lastUpdate:'2026-10-24' },
  { id:'PP-102', name:'Customer Feedback Revamp', owner:'Arjun Rao', team:'Customer Operations', start:'2026-09-21', due:'2026-11-14', status:'In progress', progress:42, budget:24000, spent:9200, priority:'Medium', notes:'Survey review is taking longer than planned.', dependencies:'Survey approval', lastUpdate:'2026-10-23' },
  { id:'PP-103', name:'Knowledge Base Refresh', owner:'Priya Shah', team:'Business Operations', start:'2026-10-05', due:'2026-10-30', status:'At risk', progress:54, budget:12000, spent:8700, priority:'High', notes:'Content owners have not submitted all articles.', dependencies:'Content approvals', lastUpdate:'2026-10-24' },
  { id:'PP-104', name:'New Starter Onboarding', owner:'Daniel Kim', team:'People Operations', start:'2026-09-15', due:'2026-11-20', status:'In progress', progress:76, budget:15000, spent:8400, priority:'Low', notes:'Pilot feedback is positive.', dependencies:'Pilot sign-off', lastUpdate:'2026-10-22' },
  { id:'PP-105', name:'Operations Metrics Pack', owner:'Sara Patel', team:'Operations Excellence', start:'2026-10-02', due:'2026-10-27', status:'Blocked', progress:35, budget:10000, spent:6100, priority:'High', notes:'Source metrics need reconciliation before reporting.', dependencies:'Validated source data', lastUpdate:'2026-10-24' },
  { id:'PP-106', name:'Internal Request Hub', owner:'Noah Williams', team:'IT Operations', start:'2026-09-28', due:'2026-11-12', status:'In progress', progress:61, budget:20000, spent:10800, priority:'Medium', notes:'Form usability testing in progress.', dependencies:'User testing', lastUpdate:'2026-10-23' },
  { id:'PP-107', name:'Quarterly Process Review', owner:'Aisha Khan', team:'PMO', start:'2026-10-08', due:'2026-10-29', status:'At risk', progress:48, budget:8000, spent:4300, priority:'Medium', notes:'Two workstream updates are outstanding.', dependencies:'Workstream updates', lastUpdate:'2026-10-24' }
];

const seedTasks = [
  {id:'T-201', projectId:'PP-101', title:'Complete accessibility review', owner:'Maya Chen', due:'2026-10-27', status:'In progress', priority:'High'},
  {id:'T-202', projectId:'PP-103', title:'Collect remaining knowledge articles', owner:'Priya Shah', due:'2026-10-25', status:'Blocked', priority:'High'},
  {id:'T-203', projectId:'PP-105', title:'Reconcile source metrics', owner:'Sara Patel', due:'2026-10-26', status:'Blocked', priority:'High'},
  {id:'T-204', projectId:'PP-107', title:'Request workstream status updates', owner:'Aisha Khan', due:'2026-10-25', status:'In progress', priority:'Medium'},
  {id:'T-205', projectId:'PP-102', title:'Review survey draft', owner:'Arjun Rao', due:'2026-10-29', status:'In progress', priority:'Medium'},
  {id:'T-206', projectId:'PP-104', title:'Document pilot feedback', owner:'Daniel Kim', due:'2026-10-28', status:'Done', priority:'Low'},
  {id:'T-207', projectId:'PP-106', title:'Run form usability test', owner:'Noah Williams', due:'2026-10-30', status:'In progress', priority:'Medium'}
];

const initialActivity = [
  {id:1, title:'Operations Metrics Pack moved to Blocked', detail:'Sara Patel · source data reconciliation', time:'Today, 10:42 AM', type:'risk'},
  {id:2, title:'Student Success Portal updated to 68%', detail:'Maya Chen · accessibility review pending', time:'Today, 9:18 AM', type:'update'},
  {id:3, title:'Knowledge Base Refresh flagged At Risk', detail:'PMO rule engine · approval dependency', time:'Yesterday, 4:35 PM', type:'risk'}
];

const palette = ['#8175ff','#39c6a5','#f4b860','#f17891','#60a5fa'];
const today = new Date();
today.setHours(0,0,0,0);
const isoToday = () => `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const daysUntil = (date) => Math.ceil((new Date(`${date}T00:00:00`) - today) / 86400000);
const fmtDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
const money = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);
const safeText = (v) => String(v ?? '').trim();

function evaluateProject(p) {
  const remaining = daysUntil(p.due);
  const progress = Number(p.progress)||0;
  const budget = Number(p.budget)||0;
  const spent = Number(p.spent)||0;
  const spendPct = budget > 0 ? spent / budget * 100 : 0;
  const flags = [];
  if (p.status === 'Blocked') flags.push({level:'Critical', reason:'Project is marked blocked', action:'Confirm the blocker owner and agree on a recovery date.'});
  if (remaining < 0 && progress < 100) flags.push({level:'Critical', reason:`Deadline passed ${Math.abs(remaining)} day(s) ago`, action:'Escalate to the sponsor and re-baseline the delivery plan.'});
  else if (remaining <= 3 && progress < 80) flags.push({level:'High', reason:`Due in ${remaining} day(s) with ${progress}% complete`, action:'Confirm remaining scope, owners and daily checkpoints.'});
  else if (remaining <= 7 && progress < 60) flags.push({level:'High', reason:`Near deadline with only ${progress}% complete`, action:'Review critical path and reassign capacity if approved.'});
  if (spendPct >= 85 && progress < 75) flags.push({level:'High', reason:`${Math.round(spendPct)}% of budget used at ${progress}% completion`, action:'Validate forecast-to-complete and review scope or spend.'});
  if (p.priority === 'High' && remaining <= 7 && progress < 75) flags.push({level:'Medium', reason:'High-priority project has limited schedule buffer', action:'Add a short sponsor checkpoint until delivery risk falls.'});
  if (flags.length === 0 && p.status !== 'Completed' && remaining <= 14 && progress < 85) flags.push({level:'Medium', reason:'Progress may be insufficient for the remaining time', action:'Ask the owner for a forecast and confirm dependencies.'});
  const order = {Critical:4,High:3,Medium:2,Low:1};
  const risk = flags.reduce((best,f)=>order[f.level]>order[best]?f.level:best,'Low');
  let status = 'On Track';
  if (p.status === 'Completed' || progress >= 100) status = 'Completed';
  else if (risk === 'Critical' || p.status === 'Blocked') status = 'Delayed';
  else if (risk === 'High' || risk === 'Medium' || p.status === 'At risk') status = 'At Risk';
  const scheduleProgress = (() => {
    const start = new Date(`${p.start}T00:00:00`).getTime();
    const end = new Date(`${p.due}T00:00:00`).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    return Math.max(0, Math.min(100, ((today.getTime()-start)/(end-start))*100));
  })();
  return {...p, remaining, spendPct, flags, risk, derivedStatus:status, scheduleProgress};
}

function makeWeeklyReport(projects, tasks) {
  const assessed = projects.map(evaluateProject);
  const critical = assessed.filter(p=>p.risk==='Critical');
  const high = assessed.filter(p=>p.risk==='High');
  const atRisk = assessed.filter(p=>['At Risk','Delayed'].includes(p.derivedStatus));
  const overdueTasks = tasks.filter(t=>t.status!=='Done' && daysUntil(t.due)<0);
  const completed = assessed.filter(p=>p.progress>=100 || p.status==='Completed');
  const avg = assessed.length ? Math.round(assessed.reduce((s,p)=>s+Number(p.progress||0),0)/assessed.length) : 0;
  const topActions = assessed.filter(p=>p.flags.length).sort((a,b)=>({Critical:4,High:3,Medium:2,Low:1}[b.risk]-({Critical:4,High:3,Medium:2,Low:1}[a.risk]))).slice(0,3);
  return {
    generated:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
    count:assessed.length, avg, atRisk:atRisk.length, critical:critical.length, high:high.length,
    completed:completed.length, overdueTasks:overdueTasks.length, topActions,
    summary:`Across ${assessed.length} active portfolio projects, average completion is ${avg}%. ${atRisk.length} project(s) need attention, including ${critical.length} critical and ${high.length} high-risk item(s). There are ${overdueTasks.length} overdue open task(s).`,
    wins:completed.length ? `${completed.length} project(s) are marked complete.` : 'No projects are marked complete yet; focus this week on removing blockers and protecting near-term milestones.'
  };
}

function downloadFile(name, content, type='text/plain;charset=utf-8') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=name; a.click();
  URL.revokeObjectURL(url);
}
function csvEscape(value) { const s=String(value ?? ''); return /[",\\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
function toCsv(rows, columns) { return [columns.join(','), ...rows.map(row=>columns.map(c=>csvEscape(row[c])).join(','))].join('\n'); }

function IconButton({label, children, onClick, className=''}) {
  return <button className={`icon-button ${className}`} title={label} aria-label={label} onClick={onClick}>{children}</button>;
}
function StatusPill({status}) {
  const value = status || 'On Track';
  const cls = value.toLowerCase().replaceAll(' ','-');
  return <span className={`status-pill ${cls}`}><span className="pill-dot"/>{value}</span>;
}
function RiskPill({risk}) {
  return <span className={`risk-pill ${String(risk).toLowerCase()}`}>{risk}</span>;
}
function MetricCard({label,value,detail,icon:Icon,tone='violet',trend}) {
  return <div className="metric-card">
    <div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18}/></span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-bottom"><span>{detail}</span>{trend && <span className="metric-trend"><ArrowUpRight size={13}/>{trend}</span>}</div>
  </div>;
}
function Modal({title, onClose, children}) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><div><h2>{title}</h2><p>Keep your portfolio data clear and actionable.</p></div><IconButton label="Close dialog" onClick={onClose}><X size={18}/></IconButton></div>
      {children}
    </div>
  </div>;
}

export default function App() {
  const [projects,setProjects] = useState(()=>{try{return JSON.parse(localStorage.getItem('pp-projects'))||seedProjects;}catch{return seedProjects;}});
  const [tasks,setTasks] = useState(()=>{try{return JSON.parse(localStorage.getItem('pp-tasks'))||seedTasks;}catch{return seedTasks;}});
  const [activity,setActivity] = useState(()=>{try{return JSON.parse(localStorage.getItem('pp-activity'))||initialActivity;}catch{return initialActivity;}});
  const [page,setPage] = useState('Overview');
  const [search,setSearch] = useState('');
  const [statusFilter,setStatusFilter] = useState('All statuses');
  const [riskFilter,setRiskFilter] = useState('All risks');
  const [showProjectModal,setShowProjectModal] = useState(false);
  const [editing,setEditing] = useState(null);
  const [showReport,setShowReport] = useState(false);
  const [toast,setToast] = useState('');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [reportCopied,setReportCopied] = useState(false);
  const importRef = useRef(null);

  React.useEffect(()=>{localStorage.setItem('pp-projects',JSON.stringify(projects));},[projects]);
  React.useEffect(()=>{localStorage.setItem('pp-tasks',JSON.stringify(tasks));},[tasks]);
  React.useEffect(()=>{localStorage.setItem('pp-activity',JSON.stringify(activity));},[activity]);
  React.useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3000);return ()=>clearTimeout(t);},[toast]);

  const assessed = useMemo(()=>projects.map(evaluateProject),[projects]);
  const report = useMemo(()=>makeWeeklyReport(projects,tasks),[projects,tasks]);
  const filtered = useMemo(()=>assessed.filter(p=>{
    const hay=`${p.name} ${p.owner} ${p.team} ${p.id}`.toLowerCase();
    return hay.includes(search.toLowerCase()) &&
      (statusFilter==='All statuses'||p.derivedStatus===statusFilter) &&
      (riskFilter==='All risks'||p.risk===riskFilter);
  }),[assessed,search,statusFilter,riskFilter]);

  const activeCount = assessed.filter(p=>p.status!=='Completed'&&p.progress<100).length;
  const atRiskCount = assessed.filter(p=>['At Risk','Delayed'].includes(p.derivedStatus)).length;
  const avgProgress = assessed.length?Math.round(assessed.reduce((s,p)=>s+Number(p.progress||0),0)/assessed.length):0;
  const budgetTotal = assessed.reduce((s,p)=>s+Number(p.budget||0),0);
  const spentTotal = assessed.reduce((s,p)=>s+Number(p.spent||0),0);
  const statusData = [
    {name:'On Track',value:assessed.filter(p=>p.derivedStatus==='On Track').length},
    {name:'At Risk',value:assessed.filter(p=>p.derivedStatus==='At Risk').length},
    {name:'Delayed',value:assessed.filter(p=>p.derivedStatus==='Delayed').length},
    {name:'Completed',value:assessed.filter(p=>p.derivedStatus==='Completed').length}
  ].filter(x=>x.value>0);
  const progressData = assessed.map(p=>({name:p.name.length>19?p.name.slice(0,17)+'…':p.name,progress:Number(p.progress),planned:Math.round(p.scheduleProgress)}));
  const weeklyTrend = [
    {week:'W-3',planned:36,actual:31},{week:'W-2',planned:48,actual:44},{week:'W-1',planned:62,actual:57},
    {week:'This week',planned:74,actual:avgProgress}
  ];
  const highRisk = [...assessed].filter(p=>p.risk==='Critical'||p.risk==='High').sort((a,b)=>({Critical:4,High:3}[b.risk]-({Critical:4,High:3}[a.risk])));
  const addActivity = (title,detail,type='update')=>setActivity(prev=>[{id:Date.now(),title,detail,time:'Just now',type},...prev].slice(0,8));

  const saveProject = (project) => {
    if(project.id && projects.some(p=>p.id===project.id)) {
      setProjects(prev=>prev.map(p=>p.id===project.id?project:p));
      addActivity(`${project.name} updated`,`${project.owner} · project details saved`);
      setToast('Project updated successfully.');
    } else {
      const newProject={...project,id:`PP-${Math.floor(100+Math.random()*900)}`,lastUpdate:isoToday()};
      setProjects(prev=>[newProject,...prev]);
      addActivity(`${newProject.name} added to portfolio`,`${newProject.owner} · new project created`);
      setToast('New project added.');
    }
    setShowProjectModal(false);setEditing(null);
  };
  const updateTaskStatus=(id,status)=>{
    setTasks(prev=>prev.map(t=>t.id===id?{...t,status}:t));
    const task=tasks.find(t=>t.id===id);
    if(task)addActivity(`Task status updated: ${task.title}`,`Changed to ${status}`);
    setToast('Task updated.');
  };
  const exportProjects=()=>downloadFile('projectpulse-projects.csv',toCsv(assessed.map(p=>({...p,flags:p.flags.map(f=>f.reason).join('; ')})),['id','name','owner','team','start','due','status','progress','budget','spent','priority','risk','derivedStatus','flags']), 'text/csv;charset=utf-8');
  const exportTasks=()=>downloadFile('projectpulse-tasks.csv',toCsv(tasks,['id','projectId','title','owner','due','status','priority']),'text/csv;charset=utf-8');
  const downloadReport=()=>{
    const body=[
      'PROJECTPULSE AI — WEEKLY PORTFOLIO REPORT',
      `Generated: ${report.generated}`,
      '',
      'EXECUTIVE SUMMARY',
      report.summary,
      report.wins,
      '',
      'PORTFOLIO SNAPSHOT',
      `Projects: ${report.count}`,
      `Average completion: ${report.avg}%`,
      `At risk or delayed: ${report.atRisk}`,
      `Critical risks: ${report.critical}`,
      `High risks: ${report.high}`,
      `Overdue open tasks: ${report.overdueTasks}`,
      '',
      'TOP PRIORITY ACTIONS',
      ...(report.topActions.length?report.topActions.map((p,i)=>`${i+1}. ${p.name} (${p.risk}) — ${p.flags[0]?.reason || 'Review project status'}. Action: ${p.flags[0]?.action || 'Confirm next steps.'}`):['No high-priority actions were identified by the current rules.']),
      '',
      'ASSUMPTIONS & LIMITATIONS',
      'This report is generated from entered project data and transparent rules. It is decision support, not a prediction guarantee. Confirm data with project owners before escalation.'
    ].join('\n');
    downloadFile('projectpulse-weekly-report.txt',body);
  };
  const handleImport=(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const lines=String(reader.result).split(/\\r?\\n/).filter(Boolean);
        const parse=(line)=>{const out=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&quoted){cur+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===','&&!quoted){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;};
        const headers=parse(lines[0]).map(h=>h.trim());
        const rows=lines.slice(1).map(line=>{const vals=parse(line);return Object.fromEntries(headers.map((h,i)=>[h,vals[i]??'']));});
        const valid=rows.filter(r=>r.name&&r.owner&&r.due).map((r,i)=>({
          id:r.id||`IMP-${Date.now()}-${i}`,name:r.name,owner:r.owner,team:r.team||'Unassigned',
          start:r.start||isoToday(),due:r.due,status:['In progress','At risk','Blocked','Completed'].includes(r.status)?r.status:'In progress',
          progress:Math.max(0,Math.min(100,Number(r.progress)||0)),budget:Math.max(0,Number(r.budget)||0),spent:Math.max(0,Number(r.spent)||0),
          priority:['High','Medium','Low'].includes(r.priority)?r.priority:'Medium',notes:r.notes||'',dependencies:r.dependencies||'',lastUpdate:isoToday()
        }));
        if(!valid.length)throw new Error('No valid rows found. Include name, owner and due columns.');
        setProjects(prev=>[...valid,...prev.filter(p=>!valid.some(v=>v.id===p.id))]);
        addActivity(`${valid.length} project(s) imported`,file.name);
        setToast(`Imported ${valid.length} project(s).`);setPage('Projects');
      }catch(err){setToast(err.message||'Could not import this CSV.');}
      e.target.value='';
    };
    reader.readAsText(file);
  };
  const resetDemo=()=>{setProjects(seedProjects);setTasks(seedTasks);setActivity(initialActivity);setToast('Demo data restored.');};

  const navItems=[
    {name:'Overview',icon:LayoutDashboard},
    {name:'Projects',icon:ClipboardList},
    {name:'Tasks & Risks',icon:ShieldCheck},
    {name:'Weekly Report',icon:FileText}
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Activity size={21}/></div><div><div className="brand-name">projectpulse<span>AI</span></div><div className="brand-sub">PROJECT CONTROL TOWER</div></div><button className="mobile-close" onClick={()=>setSidebarOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">N</div><div className="workspace-copy"><strong>Northstar Workspace</strong><span>Demo portfolio</span></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{navItems.map(({name,icon:Icon})=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{setPage(name);setSidebarOpen(false);}}><Icon size={18}/><span>{name}</span>{name==='Tasks & Risks'&&highRisk.length>0&&<span className="nav-count">{highRisk.length}</span>}</button>)}</nav>
      <div className="sidebar-spacer"/>
      <div className="sidebar-insight"><div className="insight-icon"><Sparkles size={16}/></div><div><strong>Weekly insight</strong><p>{atRiskCount} project(s) need attention. Review blockers before the next status meeting.</p><button onClick={()=>setPage('Weekly Report')}>View recommendations <ChevronRight size={13}/></button></div></div>
      <div className="sidebar-footer"><div className="user-avatar">VK</div><div className="user-copy"><strong>Portfolio Manager</strong><span>Demo account</span></div><MoreHorizontal size={18}/></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={13}/> <strong>{page}</strong></div></div>
        <div className="topbar-actions">
          <div className="demo-badge"><span/> Sample data</div>
          <IconButton label="Restore demo data" onClick={resetDemo}><RefreshCw size={17}/></IconButton>
          <IconButton label="Help and methodology" onClick={()=>setToast('Risk labels use visible rules based on due dates, progress, budget and project status.')}><CircleHelp size={17}/></IconButton>
          <div className="top-avatar">VK</div>
        </div>
      </header>

      <div className="page-content">
        {page==='Overview'&&<>
          <div className="page-heading">
            <div><div className="eyebrow"><span className="live-dot"/> PORTFOLIO INTELLIGENCE</div><h1>Good afternoon<span className="heading-period">.</span></h1><p>Your project portfolio, at a glance. Here’s what needs attention today.</p></div>
            <div className="heading-actions"><button className="btn btn-secondary" onClick={exportProjects}><Download size={16}/> Export data</button><button className="btn btn-primary" onClick={()=>{setEditing(null);setShowProjectModal(true);}}><Plus size={17}/> New project</button></div>
          </div>
          <div className="notice"><div className="notice-icon"><Sparkles size={18}/></div><div><strong>Portfolio intelligence is ready</strong><p>Risk signals are recalculated from your project data using transparent, editable-style rules. Review recommendations before taking action.</p></div><button onClick={()=>setPage('Tasks & Risks')}>Review risks <ChevronRight size={15}/></button></div>
          <div className="metrics-grid">
            <MetricCard label="Active projects" value={activeCount} detail="Across your portfolio" icon={Target} tone="violet" trend="Live"/>
            <MetricCard label="Average completion" value={`${avgProgress}%`} detail="Mean project progress" icon={Gauge} tone="mint" trend="Live"/>
            <MetricCard label="Need attention" value={atRiskCount} detail="At risk or delayed" icon={AlertTriangle} tone="amber"/>
            <MetricCard label="Budget utilized" value={`${budgetTotal?Math.round(spentTotal/budgetTotal*100):0}%`} detail={`${money(spentTotal)} of ${money(budgetTotal)}`} icon={Activity} tone="blue"/>
          </div>
          <div className="dashboard-grid">
            <section className="panel progress-panel">
              <div className="panel-header"><div><h2>Delivery performance</h2><p>Actual completion vs. time elapsed in schedule</p></div><span className="subtle-chip"><Activity size={13}/> Portfolio view</span></div>
              <div className="chart-legend"><span><i className="legend-dot violet-dot"/> Actual completion</span><span><i className="legend-dot gray-dot"/> Schedule elapsed</span></div>
              <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={progressData} layout="vertical" margin={{top:0,right:18,left:4,bottom:0}} barCategoryGap="28%"><CartesianGrid stroke="#252b3d" horizontal={false}/><XAxis type="number" domain={[0,100]} tick={{fill:'#8991a8',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="name" width={145} tick={{fill:'#b7bed0',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#171b2b',border:'1px solid #343b50',borderRadius:12,color:'#f4f6fc'}} formatter={(v,n)=>[`${v}%`,n==='progress'?'Actual completion':'Schedule elapsed']}/><Bar dataKey="planned" name="Schedule elapsed" fill="#343b50" radius={[0,5,5,0]} barSize={10}/><Bar dataKey="progress" name="Actual completion" fill="#8175ff" radius={[0,5,5,0]} barSize={10}/></BarChart></ResponsiveContainer></div>
              <div className="chart-foot"><span><span className="tiny-dot violet-dot"/> Actual project completion</span><span><span className="tiny-dot gray-dot"/> Elapsed schedule time</span></div>
            </section>
            <section className="panel health-panel">
              <div className="panel-header"><div><h2>Portfolio health</h2><p>Rule-based project status</p></div><IconButton label="View risk details" onClick={()=>setPage('Tasks & Risks')}><ChevronRight size={17}/></IconButton></div>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={83} paddingAngle={4} stroke="none">{statusData.map((entry,i)=><Cell key={entry.name} fill={({'On Track':'#39c6a5','At Risk':'#f4b860','Delayed':'#f17891','Completed':'#8175ff'})[entry.name]}/>)}</Pie><Tooltip contentStyle={{background:'#171b2b',border:'1px solid #343b50',borderRadius:12,color:'#f4f6fc'}}/></PieChart></ResponsiveContainer>
                <div className="donut-center"><strong>{assessed.length}</strong><span>Projects</span></div>
              </div>
              <div className="health-legend">{[['On Track','#39c6a5'],['At Risk','#f4b860'],['Delayed','#f17891'],['Completed','#8175ff']].map(([name,color])=><div key={name}><span><i style={{background:color}}/>{name}</span><strong>{assessed.filter(p=>p.derivedStatus===name).length}</strong></div>)}</div>
            </section>
          </div>
          <div className="dashboard-grid lower-grid">
            <section className="panel">
              <div className="panel-header"><div><h2>Priority watchlist</h2><p>Projects with the strongest risk signals</p></div><button className="text-button" onClick={()=>setPage('Tasks & Risks')}>All risks <ChevronRight size={14}/></button></div>
              <div className="watchlist">{(highRisk.length?highRisk.slice(0,4):assessed.slice(0,3)).map(p=><div className="watch-row" key={p.id}><div className={`watch-icon ${p.risk.toLowerCase()}`}><AlertTriangle size={16}/></div><div className="watch-main"><strong>{p.name}</strong><span>{p.flags[0]?.reason||'No high-priority risk detected'}</span></div><div className="watch-right"><RiskPill risk={p.risk}/><span className="due-label">Due {fmtDate(p.due)}</span></div></div>)}</div>
            </section>
            <section className="panel activity-panel">
              <div className="panel-header"><div><h2>Recent activity</h2><p>Latest portfolio updates</p></div><span className="subtle-chip">Live in this browser</span></div>
              <div className="activity-list">{activity.slice(0,4).map(a=><div className="activity-row" key={a.id}><div className={`activity-icon ${a.type}`}><CircleDot size={15}/></div><div className="activity-main"><strong>{a.title}</strong><span>{a.detail}</span><small>{a.time}</small></div></div>)}</div>
            </section>
          </div>
          <section className="panel projects-preview">
            <div className="panel-header"><div><h2>Projects overview</h2><p>Latest status across the portfolio</p></div><button className="text-button" onClick={()=>setPage('Projects')}>View all projects <ChevronRight size={14}/></button></div>
            <ProjectTable projects={assessed.slice(0,5)} onEdit={p=>{setEditing(p);setShowProjectModal(true);}}/>
          </section>
        </>}

        {page==='Projects'&&<>
          <div className="page-heading"><div><div className="eyebrow">PORTFOLIO MANAGEMENT</div><h1>Projects<span className="heading-period">.</span></h1><p>Track delivery, ownership, budget and risk signals in one place.</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={()=>importRef.current?.click()}><Upload size={16}/> Import CSV</button><button className="btn btn-secondary" onClick={exportProjects}><Download size={16}/> Export CSV</button><button className="btn btn-primary" onClick={()=>{setEditing(null);setShowProjectModal(true);}}><Plus size={17}/> New project</button><input ref={importRef} type="file" accept=".csv,text/csv" hidden onChange={handleImport}/></div></div>
          <section className="panel">
            <div className="table-toolbar"><div className="search-field"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects, owners, teams…"/></div><div className="filter-controls"><Filter size={15}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All statuses</option><option>On Track</option><option>At Risk</option><option>Delayed</option><option>Completed</option></select><select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)} aria-label="Filter by risk"><option>All risks</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>
            <ProjectTable projects={filtered} onEdit={p=>{setEditing(p);setShowProjectModal(true);}} emptyText="No projects match those filters."/>
          </section>
          <div className="table-note"><CircleHelp size={14}/> Risk and status are calculated from project data. Edit a project to correct outdated inputs.</div>
        </>}

        {page==='Tasks & Risks'&&<>
          <div className="page-heading"><div><div className="eyebrow">EARLY-WARNING CENTER</div><h1>Tasks & risks<span className="heading-period">.</span></h1><p>Prioritize blockers, deadline exposure and budget pressure before they escalate.</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={exportTasks}><Download size={16}/> Export tasks</button></div></div>
          <div className="metrics-grid three-metrics">
            <MetricCard label="Critical signals" value={assessed.filter(p=>p.risk==='Critical').length} detail="Immediate review recommended" icon={AlertTriangle} tone="rose"/>
            <MetricCard label="High-risk projects" value={assessed.filter(p=>p.risk==='High').length} detail="Action plan needed" icon={Flag} tone="amber"/>
            <MetricCard label="Overdue open tasks" value={tasks.filter(t=>t.status!=='Done'&&daysUntil(t.due)<0).length} detail="Past due date" icon={Clock3} tone="blue"/>
          </div>
          <section className="panel risk-panel">
            <div className="panel-header"><div><h2>Risk register</h2><p>Prioritized using transparent rules, not opaque AI predictions.</p></div><span className="subtle-chip"><ShieldCheck size={13}/> Explainable signals</span></div>
            <div className="risk-register">{assessed.filter(p=>p.flags.length).sort((a,b)=>({Critical:4,High:3,Medium:2,Low:1}[b.risk]-({Critical:4,High:3,Medium:2,Low:1}[a.risk]))).map(p=><div className="risk-card" key={p.id}><div className={`risk-symbol ${p.risk.toLowerCase()}`}><AlertTriangle size={18}/></div><div className="risk-card-body"><div className="risk-card-title"><strong>{p.name}</strong><RiskPill risk={p.risk}/><StatusPill status={p.derivedStatus}/></div><p>{p.flags.map(f=>f.reason).join(' · ')}</p><div className="recommended-action"><Sparkles size={14}/><span><strong>Recommended next step:</strong> {p.flags[0]?.action}</span></div><div className="risk-card-meta"><span><Users size={13}/>{p.owner}</span><span><CalendarDays size={13}/>Due {fmtDate(p.due)} ({p.remaining<0?`${Math.abs(p.remaining)}d overdue`:p.remaining===0?'today':`${p.remaining}d left`})</span><span><Activity size={13}/>{p.progress}% complete</span></div></div><button className="btn btn-secondary btn-small" onClick={()=>{setEditing(p);setShowProjectModal(true);}}>Review project</button></div>)}
              {!assessed.some(p=>p.flags.length)&&<div className="empty-state"><CheckCircle2 size={30}/><strong>No risk signals found</strong><span>All projects currently pass the configured rules.</span></div>}
            </div>
          </section>
          <section className="panel task-panel"><div className="panel-header"><div><h2>Open task tracker</h2><p>Update task statuses as work progresses.</p></div><span className="subtle-chip">{tasks.filter(t=>t.status!=='Done').length} open tasks</span></div><div className="task-list">{tasks.map(t=>{const p=projects.find(x=>x.id===t.projectId);const overdue=t.status!=='Done'&&daysUntil(t.due)<0;return <div className="task-row" key={t.id}><div className={`task-check ${t.status==='Done'?'done':''}`}>{t.status==='Done'?<Check size={14}/>:<ListChecks size={15}/>}</div><div className="task-details"><strong>{t.title}</strong><span>{p?.name||'Unassigned project'} · {t.owner}</span></div><span className={`task-due ${overdue?'overdue':''}`}>{overdue?'Overdue · ':''}{fmtDate(t.due)}</span><select aria-label={`Status for ${t.title}`} value={t.status} onChange={e=>updateTaskStatus(t.id,e.target.value)}><option>Not started</option><option>In progress</option><option>Blocked</option><option>Done</option></select></div>})}</div></section>
          <section className="panel methodology-panel"><div className="method-icon"><CircleHelp size={18}/></div><div><h3>How the risk engine works</h3><p>Signals are calculated from due date, completion, budget usage, priority and blocked status. A “Critical” label means an immediate review is recommended under these demo rules; it is not a statistical prediction. Validate all inputs with project owners.</p></div></section>
        </>}

        {page==='Weekly Report'&&<>
          <div className="page-heading"><div><div className="eyebrow">EXECUTIVE COMMUNICATION</div><h1>Weekly report<span className="heading-period">.</span></h1><p>A concise, data-driven summary to prepare for your portfolio review.</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={downloadReport}><Download size={16}/> Download report</button><button className="btn btn-primary" onClick={()=>setShowReport(true)}><FileText size={16}/> Preview report</button></div></div>
          <div className="report-cover"><div className="report-cover-top"><div className="brand-mark"><Activity size={21}/></div><span>PORTFOLIO INTELLIGENCE · WEEKLY BRIEF</span><span className="report-date">{report.generated}</span></div><h2>Project Portfolio<br/><em>Weekly Review</em></h2><p>Delivery confidence, risk exposure and the actions that matter most.</p><div className="report-cover-metrics"><div><span>Projects tracked</span><strong>{report.count}</strong></div><div><span>Average completion</span><strong>{report.avg}%</strong></div><div><span>Need attention</span><strong>{report.atRisk}</strong></div><div><span>Critical signals</span><strong>{report.critical}</strong></div></div></div>
          <div className="report-grid">
            <section className="panel report-summary"><div className="report-section-title"><span className="section-number">01</span><div><h2>Executive summary</h2><p>Portfolio status at a glance</p></div></div><p className="summary-copy">{report.summary}</p><p className="summary-copy">{report.wins}</p><div className="summary-callout"><Sparkles size={17}/><div><strong>Management focus</strong><p>{report.topActions[0]?`${report.topActions[0].name}: ${report.topActions[0].flags[0]?.action}`:'Continue routine monitoring and confirm owners have submitted current updates.'}</p></div></div></section>
            <section className="panel"><div className="report-section-title"><span className="section-number">02</span><div><h2>Priority actions</h2><p>Recommended discussion points</p></div></div><div className="action-list">{(report.topActions.length?report.topActions:assessed.slice(0,3)).map((p,i)=><div className="action-item" key={p.id}><div className="action-index">{String(i+1).padStart(2,'0')}</div><div><strong>{p.name}</strong><p>{p.flags[0]?.action||'Confirm progress, next milestone and any new blockers.'}</p><span>{p.owner} · Due {fmtDate(p.due)}</span></div><RiskPill risk={p.risk}/></div>)}</div></section>
          </div>
          <section className="panel report-projects"><div className="report-section-title"><span className="section-number">03</span><div><h2>Portfolio detail</h2><p>Completion and calculated delivery status</p></div></div><ProjectTable projects={assessed} onEdit={p=>{setEditing(p);setShowProjectModal(true);}}/></section>
          <div className="methodology-note"><ShieldCheck size={17}/><div><strong>Methodology and limitations</strong><p>This report uses the current saved project and task data. Risk labels follow explicit rules; they are not forecasts. Confirm facts, owners and due dates before sharing this report with stakeholders.</p></div></div>
        </>}
        <footer className="page-footer"><span>ProjectPulse AI <i/> Portfolio control tower</span><span>Demo data · saved in this browser only</span></footer>
      </div>
    </main>

    {showProjectModal&&<ProjectModal project={editing} onClose={()=>{setShowProjectModal(false);setEditing(null);}} onSave={saveProject}/>}
    {showReport&&<Modal title="Weekly report preview" onClose={()=>setShowReport(false)}><div className="report-preview"><div className="preview-kicker">PROJECTPULSE AI · {report.generated}</div><h3>Portfolio executive summary</h3><p>{report.summary}</p><p>{report.wins}</p><h3>Priority actions</h3>{report.topActions.length?report.topActions.map(p=><div className="preview-action" key={p.id}><strong>{p.name} · {p.risk}</strong><p>{p.flags[0]?.action}</p></div>):<p>No priority actions detected by current rules.</p>}<p className="preview-disclaimer">Rule-based decision support. Validate with project owners before sharing.</p></div><div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setShowReport(false)}>Close</button><button className="btn btn-primary" onClick={()=>{downloadReport();setShowReport(false);}}><Download size={16}/> Download report</button></div></Modal>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast('')} aria-label="Dismiss notification"><X size={14}/></button></div>}
  </div>;
}

function ProjectTable({projects,onEdit,emptyText='No projects to display.'}) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>Project</th><th>Owner / Team</th><th>Delivery status</th><th>Progress</th><th>Due date</th><th>Risk</th><th></th></tr></thead><tbody>{projects.map(p=><tr key={p.id}><td><div className="project-cell"><div className="project-initial">{p.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</div><div><strong>{p.name}</strong><span>{p.id}</span></div></div></td><td><div className="owner-cell"><strong>{p.owner}</strong><span>{p.team}</span></div></td><td><StatusPill status={p.derivedStatus}/></td><td><div className="progress-cell"><div className="progress-track"><span style={{width:`${Math.max(0,Math.min(100,p.progress))}%`}}/></div><span>{p.progress}%</span></div></td><td><span className="date-cell">{fmtDate(p.due)}</span></td><td><RiskPill risk={p.risk}/></td><td><IconButton label={`Edit ${p.name}`} onClick={()=>onEdit(p)}><ChevronRight size={16}/></IconButton></td></tr>)}{!projects.length&&<tr><td colSpan="7"><div className="empty-state"><Search size={24}/><strong>{emptyText}</strong><span>Try another search or remove a filter.</span></div></td></tr>}</tbody></table></div>;
}

function ProjectModal({project,onClose,onSave}) {
  const [form,setForm]=useState(()=>project?{...project}:{name:'',owner:'',team:'',start:isoToday(),due:'',status:'In progress',progress:0,budget:10000,spent:0,priority:'Medium',notes:'',dependencies:''});
  const [error,setError]=useState('');
  const set=(key,value)=>setForm(prev=>({...prev,[key]:value}));
  const submit=(e)=>{
    e.preventDefault();setError('');
    if(!safeText(form.name)||!safeText(form.owner)||!safeText(form.due)){setError('Please enter a project name, owner and due date.');return;}
    if(form.start&&form.due<form.start){setError('Due date must be on or after the start date.');return;}
    if(Number(form.progress)<0||Number(form.progress)>100){setError('Progress must be between 0 and 100.');return;}
    if(Number(form.spent)<0||Number(form.budget)<0){setError('Budget and spend cannot be negative.');return;}
    onSave({...form,name:safeText(form.name),owner:safeText(form.owner),team:safeText(form.team)||'Unassigned',progress:Number(form.progress),budget:Number(form.budget),spent:Number(form.spent),lastUpdate:isoToday()});
  };
  return <Modal title={project?'Edit project':'Create a project'} onClose={onClose}>
    <form className="project-form" onSubmit={submit}>
      <label>Project name *<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Customer onboarding refresh" required maxLength={100}/></label>
      <div className="form-row"><label>Project owner *<input value={form.owner} onChange={e=>set('owner',e.target.value)} placeholder="Full name" required maxLength={80}/></label><label>Team / workstream<input value={form.team} onChange={e=>set('team',e.target.value)} placeholder="e.g. Operations" maxLength={80}/></label></div>
      <div className="form-row"><label>Start date<input type="date" value={form.start} onChange={e=>set('start',e.target.value)} required/></label><label>Due date *<input type="date" value={form.due} onChange={e=>set('due',e.target.value)} min={form.start} required/></label></div>
      <div className="form-row"><label>Reported status<select value={form.status} onChange={e=>set('status',e.target.value)}><option>In progress</option><option>At risk</option><option>Blocked</option><option>Completed</option></select></label><label>Priority<select value={form.priority} onChange={e=>set('priority',e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label></div>
      <div className="form-row"><label>Completion (%)<input type="number" min="0" max="100" value={form.progress} onChange={e=>set('progress',e.target.value)} required/></label><label>Budget (USD)<input type="number" min="0" step="100" value={form.budget} onChange={e=>set('budget',e.target.value)} required/></label><label>Spent (USD)<input type="number" min="0" step="100" value={form.spent} onChange={e=>set('spent',e.target.value)} required/></label></div>
      <label>Current blocker / notes<textarea value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="What is slowing delivery? What needs attention?" rows="2" maxLength={500}/></label>
      <label>Key dependency<input value={form.dependencies||''} onChange={e=>set('dependencies',e.target.value)} placeholder="e.g. Approval from finance" maxLength={200}/></label>
      {error&&<div className="form-error"><AlertTriangle size={15}/>{error}</div>}
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary"><Check size={16}/>{project?'Save changes':'Create project'}</button></div>
    </form>
  </Modal>;
}
