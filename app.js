(() => {
  const candidates = {
    fatikha: ['Fatikha Ulinnuha', 'Informatika · Angkatan 2023', 'FU', 'Frontend · Backend · UI/UX', 'UI/UX Design', 'Akhir pekan', 'Prototipe StudyHub', 'Finalis kompetisi UI/UX kampus', 'Komunitas desain kampus'],
    salma: ['Salma Kamila', 'Sistem Informasi · Angkatan 2022', 'SK', 'Analisis Data · Python', 'Data Science', 'Hari kerja', 'Dasbor data terbuka', 'Juara 3 lomba visualisasi data', 'Komunitas data kampus'],
    chalista: ['Chalista Anggun', 'Teknologi Informasi · Angkatan 2024', 'CA', 'Business Plan · Riset Pasar', 'Business Case', 'Akhir pekan', 'Rencana bisnis Refill', 'Finalis lomba Business Case', 'Komunitas kewirausahaan kampus'],
  };
  const filterFields = ['skill', 'interest', 'program', 'year', 'availability'];
  const searchResults = Object.entries(candidates).map(([id, data], index) => {
    const [program, year] = data[1].split(' · Angkatan ');
    return {id, name:data[0], program, year, skill:data[3].split(' · '), interest:data[4], availability:data[5], score:92 - index * 4};
  });
  const activeStatuses = ['Terkirim', 'Dilihat'];
  const storageKey = 'meetzy.ajakan.v1';
  function readInvites() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function button(text, action) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'meetzy-action';
    node.textContent = text;
    node.addEventListener('click', action);
    return node;
  }
  const defaultContest = 'GEMASTIK';
  const inviteRoles = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Analis Data', 'Analis Bisnis'];
  function contestKey(contest) {
    return (contest || defaultContest).trim().replace(/\s+/g, ' ').toLowerCase();
  }
  function blocksInvite(invite) {
    return !['Ditolak', 'Dibatalkan'].includes(invite.status);
  }
  function openInvite(id, name) {
    const dialog = document.createElement('dialog');
    dialog.className = 'meetzy-dialog';
    dialog.setAttribute('aria-labelledby', 'judul-ajakan');
    dialog.innerHTML = '<h2 id="judul-ajakan">Ajak Bergabung</h2><p></p><form><div id="detail-ajakan"><label>Lomba<input name="lomba" list="lomba-ajakan" maxlength="80" required></label><datalist id="lomba-ajakan"></datalist><label>Peran<select name="peran" required></select></label><label for="pesan-ajakan">Pesan ajakan</label><textarea id="pesan-ajakan" rows="4" maxlength="300" required></textarea></div><p id="tinjauan-ajakan" hidden></p><p role="status"></p><menu><button type="button">Tutup</button><button class="meetzy-action" type="submit">Tinjau Ajakan</button></menu></form>';
    dialog.querySelector('p').textContent = 'Penerima: ' + name;
    const form = dialog.querySelector('form');
    const input = form.querySelector('textarea');
    const fields = form.querySelector('#detail-ajakan');
    const contestInput = form.elements.lomba;
    const roleInput = form.elements.peran;
    const contests = [...new Set([defaultContest, ...readNeeds().map(need => need.contest || need.title.split(' · ').slice(0,-1).join(' · ')).filter(Boolean)])];
    contestInput.value = defaultContest;
    for (const contest of contests) form.querySelector('datalist').append(new Option(contest, contest));
    roleInput.add(new Option('Pilih peran', ''));
    for (const role of inviteRoles) roleInput.add(new Option(role, role));
    const preview = form.querySelector('#tinjauan-ajakan');
    const status = form.querySelector('[role="status"]');
    const submit = form.querySelector('[type="submit"]');
    const back = form.querySelector('[type="button"]');
    let reviewing = false;
    back.addEventListener('click', () => {
      if (!reviewing) return dialog.close();
      reviewing = false;
      fields.hidden = false;
      preview.hidden = true;
      submit.textContent = 'Tinjau Ajakan';
      back.textContent = 'Tutup';
      input.focus();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const message = input.value.trim();
      const contest = contestInput.value.trim();
      const role = roleInput.value;
      if (!contest || !role) { status.textContent = 'Isi lomba dan pilih peran.'; return; }
      if (!message) {
        status.textContent = 'Isi pesan terlebih dahulu.';
        input.focus();
        return;
      }
      status.textContent = '';
      if (!reviewing) {
        reviewing = true;
        preview.textContent = `Lomba: ${contest}\nPeran: ${role}\nPesan: ${message}`;
        preview.hidden = false;
        fields.hidden = true;
        submit.textContent = 'Kirim Ajakan';
        back.textContent = 'Edit Ajakan';
        return;
      }
      const invites = readInvites();
      if (invites.some(invite => invite.id === id && contestKey(invite.contest) === contestKey(contest) && blocksInvite(invite))) {
        status.textContent = 'Kandidat ini sudah memiliki ajakan aktif atau diterima untuk lomba tersebut.';
        return;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify([{id, name, contest, role, message, status: 'Terkirim'}, ...invites]));
        location.href = 'ajakan.html?terkirim=1';
      } catch {
        status.textContent = 'Data tidak dapat disimpan. Buka proyek lewat Live Server dan coba lagi.';
      }
    });
    dialog.addEventListener('close', () => dialog.remove(), {once: true});
    document.body.append(dialog);
    dialog.showModal();
  }
  const profileAction = document.getElementById('aksi-profil');
  const id = new URLSearchParams(location.search).get('id');
  if (profileAction && Object.hasOwn(candidates, id)) {
    const details = candidates[id];
    document.querySelectorAll('[data-candidate]').forEach(node => {
      node.textContent = details[Number(node.dataset.candidate)];
    });
    const invite = button('Ajak Bergabung', () => openInvite(id, details[0]));
    invite.style.cssText = 'width:100%;height:100%;background:#BFD02E;color:#30201F;border:0';
    profileAction.replaceChildren(invite);
    const secondary = document.getElementById('aksi-dosen');
    if (readInvites().some(item => item.id === id && blocksInvite(item))) {
      invite.textContent = 'Ajak untuk Lomba Lain';
      const link = document.createElement('a');
      link.href = 'ajakan.html';
      link.className = 'meetzy-profile-status';
      link.textContent = '✓ Sudah Diajak · Lihat Status';
      secondary.replaceChildren(link);
    } else secondary.hidden = true;
  }
  const portfolio = document.getElementById('portofolio-grid');
  if (portfolio) {
    const examples = {
      fatikha: [['Aplikasi Kasir UMKM','Pengembang Frontend dan Backend','Prototipe transaksi dan pengelolaan stok.'],['Dashboard Kampus','Pengembang Frontend','Dasbor untuk merangkum informasi akademik.'],['Redesign Portal Mahasiswa','Desainer UI/UX','Wireframe dan prototipe navigasi portal.']],
      salma: [['Dasbor Data Terbuka','Analis Data','Visualisasi dan filter untuk mengeksplorasi data terbuka.'],['Analisis Survei Mahasiswa','Analis Data','Pembersihan data serta ringkasan hasil survei.'],['Prediksi Tren Kunjungan','Pengembang Python','Eksplorasi tren kunjungan dengan data contoh.']],
      chalista: [['Rencana Bisnis Refill','Penyusun Business Plan','Rencana operasional dan model pendapatan layanan isi ulang.'],['Riset Pasar UMKM','Peneliti Pasar','Pemetaan calon pelanggan dan kebutuhan mereka.'],['Pitch Deck Produk','Penyusun Strategi','Materi presentasi nilai produk dan target pasar.']],
      own: [['Studi Kasus Aplikasi Kampus','Desainer UI/UX','Rancangan ulang akses informasi akademik.'],['Peta Pengalaman Mahasiswa','Peneliti UX','Pemetaan hambatan dari pencarian hingga penggunaan layanan kampus.'],['Prototipe Portal Akademik','Desainer UI/UX','Alur navigasi dan prototipe antarmuka.']],
    };
    const candidate = Object.hasOwn(candidates,id) ? candidates[id] : null;
    const dialog = document.getElementById('detail-portofolio');
    for (const [name, role, result] of examples[candidate ? id : 'own']) {
      const card = button('', () => {
        document.getElementById('pemilik-portofolio').textContent = (candidate?.[0] || 'Princess Leonor') + ' · Proyek contoh';
        document.getElementById('nama-proyek').textContent = name;
        document.getElementById('deskripsi-proyek').textContent = result;
        document.getElementById('peran-proyek').textContent = role;
        document.getElementById('hasil-proyek').textContent = 'Rincian proyek simulasi untuk penilaian kandidat.';
        dialog.showModal();
      });
      card.className = 'mz-project';
      const visual = document.createElement('span');
      visual.className = 'mz-project-art';
      visual.setAttribute('aria-hidden','true');
      visual.textContent = '◇';
      const title = document.createElement('strong');
      title.textContent = name;
      const caption = document.createElement('small');
      caption.textContent = role;
      card.append(visual,title,caption);
      portfolio.append(card);
    }
    if (candidate) {
      renderSkills(candidate[3]);
      const score = document.getElementById('skor-profil');
      score.textContent = 'Skor kecocokan ' + searchResults.find(result => result.id === id).score + '%';
      score.hidden = false;
      document.getElementById('profil-sendiri').hidden = false;
      const save = document.getElementById('simpan-kandidat');
      save.hidden = false;
      const key = 'meetzy.kandidat-tersimpan.' + id;
      function showSaved() {
        const saved = readDemo(key) === '1';
        save.setAttribute('aria-pressed',String(saved));
        save.textContent = saved ? '✓ Kandidat Tersimpan' : 'Simpan Kandidat';
      }
      save.addEventListener('click', () => {
        if (saveDemo(key, readDemo(key) === '1' ? '0' : '1', save)) showSaved();
      });
      showSaved();
    }
  }
  function renderSkills(value) {
    const skills = document.getElementById('profil-keahlian');
    if (!skills) return;
    skills.replaceChildren(...value.split(' · ').map(text => {
      const tag = document.createElement('span');
      tag.textContent = text;
      return tag;
    }));
  }

  const searchInput = document.querySelector('.meetzy-search input');
  const query = new URLSearchParams(location.search).get('q') || '';
  if (searchInput) searchInput.value = query;

  const count = document.getElementById('jumlah-kandidat');
  if (count) {
    const fields = Object.fromEntries(filterFields.map(key => [key, document.querySelector(`[data-filter="${key}"]`)]));
    const sort = document.getElementById('urut-skor');
    let ascending = false;
    const cards = Object.fromEntries(searchResults.map(result => [result.id, document.querySelector(`[data-result="${result.id}"]`)]));
    function showResults() {
      const terms = searchInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = searchResults.filter(result => {
        const searchable = [result.name, ...filterFields.map(key => result[key])].join(' ').toLowerCase();
        return terms.every(term => searchable.includes(term)) &&
          filterFields.every(key => !fields[key].value || [result[key]].flat().includes(fields[key].value));
      }
      ).sort((a, b) => ascending ? a.score - b.score : b.score - a.score);
      for (const card of Object.values(cards)) card.hidden = true;
      matches.forEach((result, index) => {
        cards[result.id].hidden = false;
        cards[result.id].style.left = `${360 + index * 344}px`;
      });
      count.textContent = matches.length ? `${matches.length} kandidat · ${ascending ? 'Skor terendah' : 'Paling cocok'}` : 'Tidak ada kandidat yang sesuai';
      sort.textContent = ascending ? 'Urutkan: paling cocok' : 'Urutkan: skor terendah';
    }
    for (const key of filterFields) {
      const values = new Set(searchResults.flatMap(result => result[key]));
      for (const value of values) fields[key].add(new Option(value, value));
      fields[key].addEventListener('change', showResults);
    }
    sort.addEventListener('click', () => { ascending = !ascending; showResults(); });
    document.getElementById('reset-filter').addEventListener('click', () => {
      for (const field of Object.values(fields)) field.value = '';
      ascending = false;
      searchInput.value = '';
      if (query) history.replaceState(null, '', 'cari-partner.html');
      showResults();
    });
    searchInput.addEventListener('input', showResults);
    showResults();
  }

  const invites = readInvites();
  const recent = document.getElementById('ajakan-terbaru');
  if (recent && invites.length) recent.textContent = invites[0].name + ' · ' + invites[0].status;

  const empty = document.getElementById('ajakan-kosong');
  if (empty && new URLSearchParams(location.search).has('terkirim')) {
    const toast = document.createElement('div');
    toast.className = 'meetzy-toast';
    toast.setAttribute('role','status');
    toast.textContent = '✓ Ajakan berhasil dikirim.';
    document.body.append(toast);
    history.replaceState(null, '', 'ajakan.html');
    setTimeout(() => toast.remove(), 2700);
  }
  if (empty && invites.length) {
    empty.hidden = true;
    empty.nextElementSibling.style.display = 'none';
    const panel = empty.parentElement;
    panel.classList.add('meetzy-tracker-panel');
    const filters = document.createElement('div');
    filters.className = 'meetzy-tracker-filters';
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', 'Filter status ajakan');
    const list = document.createElement('ul');
    list.className = 'meetzy-invite-list';
    const notice = document.createElement('p');
    notice.className = 'meetzy-tracker-empty';
    notice.setAttribute('role','status');
    notice.hidden = true;
    const filterOptions = ['Semua', 'Terkirim', 'Dilihat', 'Diterima', 'Ditolak', 'Dibatalkan'];
    for (const status of filterOptions) {
      const control = button(status, () => {
        for (const filter of filters.children) filter.setAttribute('aria-pressed', String(filter === control));
        let visible = 0;
        for (const card of list.children) {
          card.hidden = status !== 'Semua' && card.dataset.status !== status;
          if (!card.hidden) visible++;
        }
        notice.hidden = visible > 0;
        notice.textContent = visible ? '' : 'Belum ada ajakan dengan status ' + status + '.';
        list.scrollTop = 0;
      });
      control.dataset.status = status;
      control.setAttribute('aria-pressed', String(status === 'Semua'));
      filters.append(control);
    }
    for (const [index, invite] of invites.entries()) {
      const item = document.createElement('li');
      item.className = 'meetzy-tracker-card';
      item.dataset.status = invite.status;
      const title = document.createElement('strong');
      title.textContent = invite.name;
      const badge = document.createElement('span');
      badge.className = 'meetzy-status';
      badge.dataset.status = invite.status;
      badge.textContent = invite.status;
      const message = document.createElement('p');
      message.textContent = invite.message;
      const context = document.createElement('p');
      context.textContent = (invite.contest || defaultContest) + ' · ' + (invite.role || 'Peran belum ditentukan');
      context.className = 'meetzy-tracker-context';
      message.className = 'meetzy-tracker-message';
      const progress = document.createElement('ol');
      progress.className = 'meetzy-tracker-steps';
      progress.setAttribute('aria-label', 'Tahapan ajakan');
      const stages = ['Terkirim', 'Dilihat', 'Diterima'];
      const reached = stages.indexOf(invite.status);
      stages.forEach((stage, index) => {
        const step = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = 'meetzy-tracker-dot';
        dot.setAttribute('aria-hidden', 'true');
        if (index <= reached) {
          step.classList.add('is-complete');
          dot.textContent = '✓';
        }
        if (index === reached) step.setAttribute('aria-current', 'step');
        step.append(dot, stage);
        progress.append(step);
      });
      item.append(title, badge, context, progress, message);
      function updateStatus(status, feedback) {
        const latest = readInvites();
        const current = latest[index];
        if (!current || current.id !== invite.id || current.status !== invite.status) {
          feedback.textContent = 'Status sudah berubah. Muat ulang untuk melihat data terbaru.';
          return;
        }
        if (current.status === 'Dibatalkan' && latest.some((other, position) =>
          position !== index && other.id === current.id && contestKey(other.contest) === contestKey(current.contest) && blocksInvite(other)
        )) {
          feedback.textContent = 'Kandidat sudah memiliki ajakan lain yang aktif atau diterima.';
          return;
        }
        if (status === 'Dibatalkan') current.previousStatus = current.status;
        else delete current.previousStatus;
        current.status = status;
        if (saveDemo(storageKey, JSON.stringify(latest), feedback)) location.reload();
      }
      if (activeStatuses.includes(invite.status)) {
        const tools = document.createElement('div');
        tools.className = 'meetzy-invite-tools';
        const label = document.createElement('label');
        label.textContent = 'Simulasi respons ';
        const select = document.createElement('select');
        select.add(new Option('Pilih status', ''));
        const choices = invite.status === 'Terkirim' ? ['Dilihat', 'Diterima', 'Ditolak'] : ['Diterima', 'Ditolak'];
        for (const choice of choices) select.add(new Option(choice, choice));
        const feedback = document.createElement('span');
        feedback.setAttribute('role', 'status');
        select.addEventListener('change', () => {
          if (select.value) updateStatus(select.value, feedback);
        });
        label.append(select);
        tools.append(label, button('Batalkan Ajakan', () => {
          if (window.confirm(`Batalkan ajakan untuk ${invite.name}?`)) updateStatus('Dibatalkan', feedback);
        }), feedback);
        item.append(tools);
      }
      if (invite.status === 'Dibatalkan' && activeStatuses.includes(invite.previousStatus)) {
        const feedback = document.createElement('span');
        feedback.setAttribute('role', 'status');
        item.append(button('Urungkan Pembatalan', () => updateStatus(invite.previousStatus, feedback)), feedback);
      }
      list.append(item);
    }
    panel.append(filters, list, notice);
  }
  function saveDemo(key, value, feedback) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      feedback.textContent = 'Penyimpanan tidak tersedia. Coba buka proyek lewat Live Server.';
      return false;
    }
  }
  function readDemo(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  const profileKey = 'meetzy.profil.v1';
  const lecturerKey = 'meetzy.dosen.maya.v1';
  const onboarding = document.getElementById('lengkapi-profil');
  if (onboarding) onboarding.hidden = Boolean(readDemo(profileKey));
  function readSettings(key) {
    try { return JSON.parse(readDemo(key)) || {}; } catch { return {}; }
  }
  function openSettings(title, specs, onSave) {
    const dialog = document.createElement('dialog');
    dialog.className = 'meetzy-dialog';
    dialog.setAttribute('aria-labelledby', 'judul-pengaturan');
    const heading = document.createElement('h2');
    heading.id = 'judul-pengaturan';
    heading.textContent = title;
    const form = document.createElement('form');
    for (const spec of specs) {
      const label = document.createElement('label');
      label.textContent = spec.label;
      const control = document.createElement(spec.options ? 'select' : 'input');
      control.name = spec.name;
      control.required = true;
      if (spec.options) {
        for (const [value, text] of spec.options) control.add(new Option(text, value));
      } else {
        control.maxLength = 60;
      }
      control.value = spec.value;
      label.append(control);
      form.append(label);
    }
    const feedback = document.createElement('p');
    feedback.setAttribute('role', 'status');
    const actions = document.createElement('menu');
    const save = button('Simpan');
    save.type = 'submit';
    actions.append(button('Kembali', () => dialog.close()), save);
    form.append(feedback, actions);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
      if (Object.values(values).some(value => !value)) {
        feedback.textContent = 'Lengkapi semua kolom.';
        return;
      }
      if (onSave(values, feedback)) dialog.close();
    });
    dialog.append(heading, form);
    dialog.addEventListener('close', () => dialog.remove(), {once:true});
    document.body.append(dialog);
    dialog.showModal();
  }
  if (profileAction && !Object.hasOwn(candidates, id)) {
    let profile = {skill:'UI/UX', interest:'UI/UX Design', availability:'Akhir pekan', ...readSettings(profileKey)};
    const fields = [['skill','Keahlian',3],['interest','Minat lomba',4],['availability','Ketersediaan',5]];
    function showProfile() {
      for (const [name, , number] of fields) {
        if (number === 3) renderSkills(profile[name]);
        else document.querySelector(`[data-candidate="${number}"]`).textContent = profile[name];
      }
    }
    function mountAction(holder, title, action, primary) {
      const control = button(title, action);
      control.style.cssText = primary ? 'width:100%;height:100%' : 'width:100%;height:100%;background:#FFFCF6;color:#30201F;border-color:#E4D8CF';
      holder.replaceChildren(control);
    }
    function editProfile() {
      openSettings('Edit Profil Saya', fields.map(([name, label]) => ({name, label, value:profile[name]})), (values, feedback) => {
        if (!saveDemo(profileKey, JSON.stringify(values), feedback)) return false;
        profile = values;
        showProfile();
        return true;
      });
    }
    mountAction(profileAction, 'Edit Profil Saya', editProfile, true);
    if (new URLSearchParams(location.search).has('edit')) editProfile();
    mountAction(document.getElementById('aksi-dosen'), 'Buka mode dosen', () => {
      const lecturer = {expertise:'Desain Interaksi dan UX Research', interest:'UI/UX Design', schedule:'Hari kerja', availability:'yes', ...readSettings(lecturerKey)};
      openSettings('Mode dosen · Dr. Maya Wibowo', [
        {name:'expertise', label:'Bidang keahlian', value:lecturer.expertise},
        {name:'interest', label:'Minat lomba', value:lecturer.interest},
        {name:'schedule', label:'Ketersediaan jadwal', value:lecturer.schedule},
        {name:'availability', label:'Kesediaan membimbing', value:lecturer.availability, options:[['yes','Bersedia'],['no','Tidak tersedia']]},
      ], (values, feedback) => saveDemo(lecturerKey, JSON.stringify(values), feedback));
    }, false);
    showProfile();
  }

  const needKey = 'meetzy.kebutuhan.v1';
  function readNeeds() {
    const stored = readSettings(needKey);
    const entries = Array.isArray(stored) ? stored : [stored];
    return entries.filter(entry => entry && typeof entry.title === 'string');
  }
  const homeCandidates = document.getElementById('beranda-kandidat');
  if (homeCandidates) {
    for (const result of searchResults) {
      const [name, program, initials] = candidates[result.id];
      const card = document.createElement('article');
      card.className = 'mz-project';
      const avatar = document.createElement('span');
      avatar.className = 'mz-avatar';
      avatar.textContent = initials;
      const title = document.createElement('strong');
      title.textContent = name;
      const desc = document.createElement('small');
      desc.textContent = program;
      const skills = document.createElement('small');
      skills.textContent = result.skill.join(' · ');
      const score = document.createElement('small');
      score.textContent = 'Skor ' + result.score + '%';
      const link = document.createElement('a');
      link.href = 'profil.html?id=' + result.id;
      link.className = 'mz-secondary';
      link.textContent = 'Lihat Profil';
      card.append(avatar,score,title,desc,skills,link);
      homeCandidates.append(card);
    }
    const stats = document.getElementById('beranda-statistik');
    for (const status of ['Terkirim','Dilihat','Diterima','Ditolak']) {
      const card = document.createElement('div');
      card.textContent = invites.filter(invite => invite.status === status).length + ' · ' + status;
      stats.append(card);
    }
    const recent = document.getElementById('beranda-ajakan');
    for (const invite of invites.slice(0,3)) {
      const row = document.createElement('li');
      const info = document.createElement('span');
      info.textContent = invite.name + ' · ' + (invite.contest || defaultContest) + ' · ' + (invite.role || 'Peran belum ditentukan');
      const status = document.createElement('strong');
      status.className = 'meetzy-status';
      status.dataset.status = invite.status;
      status.textContent = invite.status;
      row.append(info,status);
      recent.append(row);
    }
    if (!recent.children.length) {
      const row = document.createElement('li');
      row.textContent = 'Belum ada ajakan.';
      recent.append(row);
    }
    const form = document.getElementById('form-kebutuhan-beranda');
    for (const role of inviteRoles) form.elements.peran.add(new Option(role,role));
    const feedback = form.querySelector('[role="status"]');
    const deadlines = document.getElementById('beranda-tenggat');
    function showDeadlines() {
      deadlines.replaceChildren();
      const entries = readNeeds().filter(need => need.deadline).sort((a,b) => a.deadline.localeCompare(b.deadline));
      for (const entry of entries.slice(0,3)) {
        const row = document.createElement('li');
        row.textContent = entry.contest + ' · ' + new Date(entry.deadline + 'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});
        deadlines.append(row);
      }
      if (!entries.length) {
        const row = document.createElement('li');
        row.textContent = 'Belum ada tenggat yang disimpan.';
        deadlines.append(row);
      }
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const contest = form.elements.lomba.value.trim();
      if (!contest) { feedback.textContent = 'Isi nama lomba.'; return; }
      const role = form.elements.peran.value;
      const entry = {id:String(Date.now()), title:contest + ' · ' + role, contest, role,
        quantity:Number(form.elements.jumlah.value), deadline:form.elements.tenggat.value, owner:true};
      if (saveDemo(needKey, JSON.stringify([entry,...readNeeds()]), feedback)) {
        form.reset();
        feedback.textContent = 'Kebutuhan tim tersimpan.';
        showDeadlines();
      }
    });
    showDeadlines();
  }
  const needButton = document.getElementById('buat-kebutuhan');
  if (needButton) needButton.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'meetzy-dialog';
    dialog.setAttribute('aria-labelledby', 'judul-kebutuhan');
    dialog.innerHTML = '<h2 id="judul-kebutuhan">Buat Kebutuhan Tim</h2><form><label>Nama atau bidang lomba<input name="lomba" maxlength="80" required></label><label>Peran yang dibutuhkan<select name="peran" required><option value="">Pilih peran</option><option>UI/UX Designer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Analis Data</option><option>Analis Bisnis</option></select></label><p role="status"></p><menu><button type="button">Kembali</button><button class="meetzy-action" type="submit">Publikasikan</button></menu></form>';
    const form = dialog.querySelector('form');
    const feedback = form.querySelector('[role="status"]');
    form.querySelector('[type="button"]').addEventListener('click', () => dialog.close());
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const contest = String(data.get('lomba')).trim();
      if (!contest) {
        feedback.textContent = 'Isi nama atau bidang lomba.';
        return;
      }
      const title = contest + ' · ' + data.get('peran');
      const entry = {id: String(Date.now()), title, contest, role:data.get('peran'), owner:true};
      if (saveDemo(needKey, JSON.stringify([entry, ...readNeeds()]), feedback)) location.href = 'cari-partner.html';
    });
    dialog.addEventListener('close', () => dialog.remove(), {once:true});
    document.body.append(dialog);
    dialog.showModal();
  });
  const needLabel = document.getElementById('kebutuhan-terbuka');
  const join = document.getElementById('ajukan-bergabung');
  if (needLabel && join) {
    const entries = readNeeds();
    if (entries.length) {
      const published = document.createElement('div');
      published.className = 'meetzy-published';
      published.setAttribute('aria-label','Kebutuhan yang kamu publikasikan');
      const title = document.createElement('strong');
      title.textContent = 'Kebutuhan timmu';
      const list = document.createElement('ul');
      for (const entry of entries) {
        const item = document.createElement('li');
        item.textContent = entry.title + (entry.quantity ? ' · ' + entry.quantity + ' posisi' : '') + (entry.deadline ? ' · tenggat ' + entry.deadline : '');
        list.append(item);
      }
      published.append(title, list);
      needLabel.parentElement.append(published);
      needLabel.parentElement.style.height = '284px';
    }
    const joinKey = 'meetzy.pengajuan.contoh.v1';
    function showJoined() {
      join.disabled = true;
      join.textContent = 'Pengajuan dikirim';
      document.getElementById('posisi-contoh').textContent = 'Menunggu respons tim';
    }
    if (readDemo(joinKey)) showJoined();
    join.addEventListener('click', () => {
      if (saveDemo(joinKey, 'true', needLabel)) showJoined();
    });
  }

  const team = document.getElementById('panel-tim');
  const contests = new Map();
  for (const invite of invites.filter(item => item.status === 'Diterima')) {
    contests.set(contestKey(invite.contest), invite.contest || defaultContest);
  }
  const requestedContest = new URLSearchParams(location.search).get('lomba');
  const selectedContest = contests.get(contestKey(requestedContest)) || contests.values().next().value;
  const teamInvites = invites.filter(item => contestKey(item.contest) === contestKey(selectedContest));
  const members = [...new Set(teamInvites.filter(invite => invite.status === 'Diterima').map(invite => invite.name))];
  if (team && members.length) {
    const advisorKey = 'meetzy.pembimbing.v1' + (contestKey(selectedContest) === contestKey(defaultContest) ? '' : '.' + contestKey(selectedContest));
    const roleKey = 'meetzy.peran-tim.v1';
    const memberMode = readDemo(roleKey) === 'anggota';
    const lecturer = {expertise:'Desain Interaksi dan UX Research', interest:'UI/UX Design', schedule:'Hari kerja', availability:'yes', ...readSettings(lecturerKey)};
    const canChoose = lecturer.availability === 'yes';
    team.classList.add('meetzy-team');
    team.innerHTML = '<h2></h2><p id="ringkasan-tim"></p><ul></ul><p id="pembimbing-terpilih"></p><h3>Daftar dosen pembimbing</h3><p><strong>Dr. Maya Wibowo</strong> <span id="profil-pembimbing"></span></p><p><strong>Dr. Arif Hakim</strong> · Rekayasa Perangkat Lunak · Tidak tersedia</p><div class="meetzy-invite-tools"></div><p role="status"></p>';
    team.querySelector('h2').textContent = 'Tim ' + selectedContest;
    const filledRoles = new Set(teamInvites.filter(item => item.status === 'Diterima').map(item => item.role));
    const neededRoles = [...new Set(readNeeds().filter(need => contestKey(need.contest || need.title.split(' · ').slice(0,-1).join(' · ')) === contestKey(selectedContest)).map(need => need.role || need.title.split(' · ').at(-1)))].filter(role => !filledRoles.has(role));
    const activeCount = teamInvites.filter(item => activeStatuses.includes(item.status)).length;
    const summary = team.querySelector('#ringkasan-tim');
    summary.textContent = `Anggota: ${members.length + 1} · Ajakan aktif: ${activeCount} · Peran terbuka: ${neededRoles.join(', ') || 'Tidak ada yang tercatat'}`;
    if (contests.size > 1) {
      const label = document.createElement('label');
      label.textContent = 'Pilih tim ';
      const select = document.createElement('select');
      for (const [key,name] of contests) select.add(new Option(name,key));
      select.value = contestKey(selectedContest);
      select.addEventListener('change', () => { location.search = new URLSearchParams({lomba:select.value}).toString(); });
      label.append(select);
      summary.before(label);
    }
    team.querySelector('#profil-pembimbing').textContent = '· ' + lecturer.expertise + ' · ' + lecturer.schedule + ' · ' + (canChoose ? 'Bersedia' : 'Tidak tersedia');
    const list = team.querySelector('ul');
    for (const name of ['Princess Leonor · ' + (memberMode ? 'Anggota' : 'Ketua tim'), ...members.map(name => name + ' · Anggota')]) {
      const item = document.createElement('li');
      item.textContent = name;
      list.append(item);
    }
    const advisor = team.querySelector('#pembimbing-terpilih');
    const controls = team.querySelector('.meetzy-invite-tools');
    const feedback = team.querySelector('[role="status"]');
    const choose = button('Pilih Dr. Maya Wibowo', () => {
      if (memberMode || !canChoose || !window.confirm('Pilih Dr. Maya Wibowo sebagai pembimbing tim?')) return;
      if (saveDemo(advisorKey, 'Dr. Maya Wibowo', feedback)) showAdvisor();
    });
    function showAdvisor() {
      const selected = readDemo(advisorKey);
      advisor.textContent = 'Pembimbing: ' + (selected || 'Belum dipilih');
      choose.disabled = memberMode || !canChoose || Boolean(selected);
      choose.textContent = memberMode ? 'Khusus ketua tim' : selected ? 'Pembimbing sudah dipilih' : canChoose ? 'Pilih Dr. Maya Wibowo' : 'Dosen tidak tersedia';
    }
    controls.append(choose, button(memberMode ? 'Simulasi sebagai ketua' : 'Simulasi sebagai anggota', () => {
      if (saveDemo(roleKey, memberMode ? 'ketua' : 'anggota', feedback)) location.reload();
    }));
    showAdvisor();
  }
})();
