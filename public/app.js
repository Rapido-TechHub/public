const state = { students: [], selectedStudentId: null };
const $ = (selector) => document.querySelector(selector);

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
}[char]));

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Não foi possível concluir a operação.');
  return body;
}

function showAlert(message, type = 'success') {
  const alert = $('#alert');
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  window.setTimeout(() => alert.classList.add('d-none'), 3500);
}

function statusBadge(status) {
  const classes = { APROVADO: 'status-approved', REPROVADO: 'status-failed', PENDENTE: 'status-pending' };
  return `<span class="status ${classes[status]}">${status}</span>`;
}

function renderStats() {
  $('#total-students').textContent = state.students.length;
  $('#approved-students').textContent = state.students.filter((s) => s.status === 'APROVADO').length;
  $('#failed-students').textContent = state.students.filter((s) => s.status === 'REPROVADO').length;
  $('#pending-students').textContent = state.students.filter((s) => s.status === 'PENDENTE').length;
  $('#student-count').textContent = `${state.students.length} ${state.students.length === 1 ? 'registro' : 'registros'}`;
}

function renderStudents() {
  const table = $('#students-table');
  const search = $('#student-search').value.trim().toLowerCase();
  const students = state.students.filter((student) =>
    `${student.name} ${student.email || ''}`.toLowerCase().includes(search),
  );
  if (!students.length) {
    table.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-5">Nenhum aluno cadastrado.</td></tr>';
    renderStats();
    return;
  }
  table.innerHTML = students.map((student) => `
    <tr class="${state.selectedStudentId === student.id ? 'table-primary' : ''}">
      <td class="ps-4"><div class="student-name">${escapeHtml(student.name)}</div><div class="student-email">${escapeHtml(student.email || 'Sem e-mail')}</div></td>
      <td><strong>${student.average === null ? '—' : student.average.toFixed(2).replace('.', ',')}</strong></td>
      <td>${statusBadge(student.status)}</td>
      <td><button class="btn btn-sm btn-outline-secondary" data-action="grades" data-id="${student.id}">${student.grades.length} ${student.grades.length === 1 ? 'nota' : 'notas'}</button></td>
      <td class="text-end pe-4 text-nowrap"><button class="btn btn-sm btn-link text-decoration-none" data-action="edit" data-id="${student.id}">Editar</button><button class="btn btn-sm btn-link text-danger text-decoration-none" data-action="delete" data-id="${student.id}">Excluir</button></td>
    </tr>`).join('');
  renderStats();
}

function selectedStudent() { return state.students.find((student) => student.id === state.selectedStudentId); }

function renderGrades() {
  const student = selectedStudent();
  $('#no-student-selected').classList.toggle('d-none', Boolean(student));
  $('#grade-manager').classList.toggle('d-none', !student);
  if (!student) return;
  $('#selected-student-name').textContent = student.name;
  $('#grades-list').innerHTML = student.grades.length ? student.grades.map((grade) => `
    <div class="grade-row d-flex justify-content-between align-items-center gap-2">
      <div><div class="small fw-semibold">${escapeHtml(grade.subject)}</div><div class="text-secondary small">Nota lançada</div></div>
      <div class="d-flex align-items-center gap-2"><span class="grade-score">${Number(grade.score).toFixed(2).replace('.', ',')}</span><button class="btn btn-sm btn-link p-0 text-decoration-none" data-grade-action="edit" data-id="${grade.id}">Editar</button><button class="btn btn-sm btn-link p-0 text-danger text-decoration-none" data-grade-action="delete" data-id="${grade.id}">Excluir</button></div>
    </div>`).join('') : '<p class="text-secondary small mb-0">Nenhuma nota lançada para este aluno.</p>';
}

async function loadStudents() {
  state.students = await api('/students');
  if (!selectedStudent()) state.selectedStudentId = null;
  renderStudents();
  renderGrades();
}

function resetStudentForm() {
  $('#student-form').reset();
  $('#student-id').value = '';
  $('#student-form-title').textContent = 'Novo aluno';
  $('#student-submit').textContent = 'Cadastrar aluno';
  $('#cancel-edit').classList.add('d-none');
}

function resetGradeForm() {
  $('#grade-form').reset();
  $('#grade-id').value = '';
  $('#grade-submit').textContent = 'Lançar nota';
  $('#cancel-grade-edit').classList.add('d-none');
}

$('#student-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('#student-id').value;
  const data = { name: $('#student-name').value.trim(), email: $('#student-email').value.trim() || undefined };
  try {
    await api(id ? `/students/${id}` : '/students', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(data) });
    resetStudentForm(); await loadStudents(); showAlert(id ? 'Aluno atualizado.' : 'Aluno cadastrado.');
  } catch (error) { showAlert(error.message, 'danger'); }
});

$('#grade-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const student = selectedStudent(); if (!student) return;
  const id = $('#grade-id').value;
  const data = { subject: $('#grade-subject').value.trim(), score: Number($('#grade-score').value) };
  try {
    await api(`/students/${student.id}/grades${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body: JSON.stringify(data) });
    resetGradeForm(); await loadStudents(); showAlert(id ? 'Nota atualizada.' : 'Nota lançada.');
  } catch (error) { showAlert(error.message, 'danger'); }
});

$('#students-table').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const student = state.students.find((item) => item.id === Number(button.dataset.id)); if (!student) return;
  if (button.dataset.action === 'grades') { state.selectedStudentId = student.id; renderStudents(); renderGrades(); return; }
  if (button.dataset.action === 'edit') {
    $('#student-id').value = student.id; $('#student-name').value = student.name; $('#student-email').value = student.email || '';
    $('#student-form-title').textContent = 'Editar aluno'; $('#student-submit').textContent = 'Salvar alterações'; $('#cancel-edit').classList.remove('d-none');
    $('#student-name').focus(); return;
  }
  if (button.dataset.action === 'delete' && window.confirm(`Excluir o aluno ${student.name} e todas as suas notas?`)) {
    try { await api(`/students/${student.id}`, { method: 'DELETE' }); if (state.selectedStudentId === student.id) state.selectedStudentId = null; await loadStudents(); showAlert('Aluno removido.'); }
    catch (error) { showAlert(error.message, 'danger'); }
  }
});

$('#grades-list').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-grade-action]'); if (!button) return;
  const student = selectedStudent(); const grade = student?.grades.find((item) => item.id === Number(button.dataset.id)); if (!student || !grade) return;
  if (button.dataset.gradeAction === 'edit') {
    $('#grade-id').value = grade.id; $('#grade-subject').value = grade.subject; $('#grade-score').value = grade.score;
    $('#grade-submit').textContent = 'Salvar nota'; $('#cancel-grade-edit').classList.remove('d-none'); $('#grade-subject').focus(); return;
  }
  if (window.confirm(`Excluir a nota de ${grade.subject}?`)) {
    try { await api(`/students/${student.id}/grades/${grade.id}`, { method: 'DELETE' }); await loadStudents(); showAlert('Nota removida.'); }
    catch (error) { showAlert(error.message, 'danger'); }
  }
});

const splashStartTime = Date.now();
const MIN_SPLASH_TIME_MS = 1200;

function hideSplashScreen() {
  const splash = $('#splash-screen');
  if (!splash) return;
  const elapsed = Date.now() - splashStartTime;
  const remaining = Math.max(0, MIN_SPLASH_TIME_MS - elapsed);

  setTimeout(() => {
    splash.classList.add('splash-hidden');
    setTimeout(() => splash.remove(), 600);
  }, remaining);
}

$('#cancel-edit').addEventListener('click', resetStudentForm);
$('#cancel-grade-edit').addEventListener('click', resetGradeForm);
$('#refresh-button').addEventListener('click', () => loadStudents().catch((error) => showAlert(error.message, 'danger')));
$('#student-search').addEventListener('input', renderStudents);

loadStudents()
  .catch((error) => showAlert(error.message, 'danger'))
  .finally(() => hideSplashScreen());

