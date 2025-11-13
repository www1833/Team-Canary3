// 共通定数とダミーデータ
const STORAGE_KEYS = {
  members: 'canary_members',
  gallery: 'canary_gallery',
  inquiries: 'canary_inquiries'
};

const ADMIN_SESSION_KEY = 'canary_admin_logged_in';

const ADMIN_CREDENTIALS = {
  id: 'admin',
  password: 'user'
};

const defaultMembers = [
  {
    id: 'm-1',
    name: '佐藤 陽介',
    number: 10,
    position: '投手',
    bio: 'エース右腕。制球力と緩急を活かしたピッチングでチームを牽引します。',
    photoUrl: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm-2',
    name: '田中 颯太',
    number: 8,
    position: '遊撃手',
    bio: '俊足と広い守備範囲が持ち味。攻守で躍動するムードメーカー。',
    photoUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm-3',
    name: '吉田 彩花',
    number: 25,
    position: '外野手',
    bio: 'チーム随一の強肩外野手。勝負強いバッティングで打線を支えます。',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'm-4',
    name: '松本 健太',
    number: 2,
    position: '捕手',
    bio: '冷静な配球とリードで投手陣を支える扇の要。試合中の声掛けも大きな武器です。',
    photoUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=400&q=80'
  }
];

const defaultGallery = [
  {
    id: 'g-1',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=900&q=80',
    caption: '試合前の円陣で士気を高めるカナリア軍団'
  },
  {
    id: 'g-2',
    imageUrl: 'https://images.unsplash.com/photo-1528191710846-99c1da010ca1?auto=format&fit=crop&w=900&q=80',
    caption: 'ナイターゲームで放たれた値千金のホームラン'
  },
  {
    id: 'g-3',
    imageUrl: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=900&q=80',
    caption: '守備練習で鍛えた連携プレー'
  },
  {
    id: 'g-4',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    caption: '地域の少年野球教室での指導風景'
  }
];

let adminPanelsInitialized = false;

// ----- ストレージ操作のヘルパー -----
function readStorageArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn('ローカルストレージの読み込みに失敗しました', error);
    return null;
  }
}

function saveStorageArray(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('ローカルストレージへの保存に失敗しました', error);
  }
}

function getMembersData({ initializeStorage = false } = {}) {
  const stored = readStorageArray(STORAGE_KEYS.members);
  if (stored) return stored;
  if (initializeStorage) {
    saveStorageArray(STORAGE_KEYS.members, defaultMembers);
    return defaultMembers.map((member) => ({ ...member }));
  }
  return defaultMembers.map((member) => ({ ...member }));
}

function getGalleryData({ initializeStorage = false } = {}) {
  const stored = readStorageArray(STORAGE_KEYS.gallery);
  if (stored) return stored;
  if (initializeStorage) {
    saveStorageArray(STORAGE_KEYS.gallery, defaultGallery);
    return defaultGallery.map((item) => ({ ...item }));
  }
  return defaultGallery.map((item) => ({ ...item }));
}

function getInquiriesData({ initializeStorage = false } = {}) {
  const stored = readStorageArray(STORAGE_KEYS.inquiries);
  if (Array.isArray(stored)) return stored;
  if (initializeStorage) {
    saveStorageArray(STORAGE_KEYS.inquiries, []);
    return [];
  }
  return [];
}

function resetMembersData() {
  saveStorageArray(STORAGE_KEYS.members, defaultMembers);
}

function resetGalleryData() {
  saveStorageArray(STORAGE_KEYS.gallery, defaultGallery);
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase() || name[0];
}

function formatDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function truncateText(text, maxLength = 60) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result);
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('ファイルの読み込みに失敗しました。'));
    };
    reader.readAsDataURL(file);
  });
}

// ----- ナビゲーションと共通UI -----
function setupNavigation(pageId) {
  const nav = document.querySelector('.site-nav');
  const toggle = nav?.querySelector('.site-nav__toggle');
  const menu = nav?.querySelector('.site-nav__list');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const navLinks = document.querySelectorAll('.site-nav__link');
  const targetMap = {
    home: 'index.html',
    members: 'members.html',
    admin: 'admin.html'
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    const matches = href.includes(targetMap[pageId]);
    if (matches) {
      link.classList.add('is-active');
    }
  });
}

function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

// ----- ギャラリー表示（トップページ） -----
function renderGallery() {
  const container = document.querySelector('[data-gallery-container]');
  if (!container) return;

  const galleryItems = getGalleryData();
  if (!galleryItems.length) {
    container.innerHTML = '<p>ギャラリー画像がまだ登録されていません。</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  galleryItems.forEach((item) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-card';
    figure.tabIndex = 0;
    figure.dataset.galleryId = item.id;

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.caption || 'ギャラリー画像';

    const caption = document.createElement('figcaption');
    caption.textContent = item.caption ?? '';

    figure.append(img, caption);
    fragment.appendChild(figure);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

function setupContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const messageEl = document.querySelector('[data-contact-message]');
  let clearTimer = null;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const payload = {
      id: generateId('inq'),
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      submittedAt: formatDateTime(new Date())
    };

    if (!payload.name || !payload.email || !payload.message) {
      if (messageEl) {
        messageEl.textContent = '未入力の項目があります。ご確認ください。';
      }
      return;
    }

    const inquiries = getInquiriesData({ initializeStorage: true });
    saveStorageArray(STORAGE_KEYS.inquiries, [...inquiries, payload]);

    form.reset();

    if (messageEl) {
      messageEl.textContent = 'お問い合わせを送信しました。ありがとうございます！';
      if (clearTimer) {
        clearTimeout(clearTimer);
      }
      clearTimer = setTimeout(() => {
        messageEl.textContent = '';
      }, 4000);
    }
  });
}

function setupGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  const overlay = modal.querySelector('[data-modal-close]');
  const closeButtons = modal.querySelectorAll('[data-modal-close]');
  const modalImage = modal.querySelector('.modal__image');
  const modalCaption = modal.querySelector('.modal__caption');
  let activeTrigger = null;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    modalImage.alt = '';
    modalCaption.textContent = '';
    if (activeTrigger) {
      activeTrigger.focus();
      activeTrigger = null;
    }
    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function openModal(item, trigger) {
    if (!item) return;
    activeTrigger = trigger;
    modalImage.src = item.imageUrl;
    modalImage.alt = item.caption || 'ギャラリー画像';
    modalCaption.textContent = item.caption ?? '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', handleKeydown);
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const figure = target.closest('.gallery-card');
    if (figure && figure.dataset.galleryId) {
      const galleryItems = getGalleryData();
      const item = galleryItems.find((data) => data.id === figure.dataset.galleryId);
      openModal(item, figure);
    }
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (event.key === 'Enter' && target instanceof Element && target.classList.contains('gallery-card')) {
      const galleryItems = getGalleryData();
      const item = galleryItems.find((data) => data.id === target.dataset.galleryId);
      openModal(item, target);
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }
}

// ----- メンバー表示（メンバー紹介ページ） -----
function renderMembersCards() {
  const container = document.querySelector('[data-member-list]');
  if (!container) return;

  const members = getMembersData();
  if (!members.length) {
    container.innerHTML = '<p>メンバー情報が登録されていません。</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  members.forEach((member) => {
    const card = document.createElement('article');
    card.className = 'member-card';

    const avatar = document.createElement('div');
    avatar.className = 'member-card__avatar';

    if (member.photoUrl) {
      const img = document.createElement('img');
      img.src = member.photoUrl;
      img.alt = `${member.name}の写真`;
      avatar.appendChild(img);
    } else {
      avatar.textContent = getInitials(member.name);
      avatar.classList.add('member-card__avatar--placeholder');
    }

    const info = document.createElement('div');
    info.className = 'member-card__info';

    const nameEl = document.createElement('h3');
    nameEl.textContent = member.name;

    const meta = document.createElement('p');
    meta.className = 'member-card__meta';
    meta.textContent = `#${member.number} / ${member.position}`;

    const bio = document.createElement('p');
    bio.className = 'member-card__bio';
    bio.textContent = member.bio ?? '';

    info.append(nameEl, meta, bio);
    card.append(avatar, info);
    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

// ----- 管理画面：ログイン処理 -----
function setupAdminLogin() {
  const loginPanel = document.querySelector('[data-login-panel]');
  const loginForm = document.querySelector('[data-login-form]');
  const loginMessage = document.querySelector('[data-login-message]');
  const adminPanels = document.querySelector('[data-admin-panels]');

  if (!loginPanel || !loginForm || !adminPanels) return;

  const showAdminPanels = () => {
    loginPanel.hidden = true;
    adminPanels.hidden = false;
    initializeAdminPanels();
  };

  const hideAdminPanels = () => {
    adminPanels.hidden = true;
    loginPanel.hidden = false;
  };

  const isLoggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  if (isLoggedIn) {
    showAdminPanels();
    return;
  }

  hideAdminPanels();

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const loginId = String(formData.get('loginId') ?? '').trim();
    const loginPassword = String(formData.get('loginPassword') ?? '').trim();

    if (loginMessage) {
      loginMessage.textContent = '';
    }

    if (loginId === ADMIN_CREDENTIALS.id && loginPassword === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      if (loginMessage) {
        loginMessage.textContent = 'ログインしました。';
      }
      showAdminPanels();
    } else {
      if (loginMessage) {
        loginMessage.textContent = 'ID またはパスワードが正しくありません。';
      }
    }
  });
}

// ----- 管理画面：メンバー & ギャラリー管理 -----
function initializeAdminPanels() {
  if (adminPanelsInitialized) return;
  adminPanelsInitialized = true;
  setupMemberAdmin();
  setupGalleryAdmin();
  setupInquiryAdmin();
}

function setupMemberAdmin() {
  const form = document.querySelector('[data-member-form]');
  const tableBody = document.querySelector('[data-member-table]');
  const message = document.querySelector('[data-member-message]');
  const submitButton = document.querySelector('[data-member-submit]');
  const cancelButton = document.querySelector('[data-member-cancel]');
  const resetButton = document.querySelector('[data-reset-members]');

  if (!form || !tableBody || !submitButton) return;

  let editingId = null;

  function refreshTable() {
    const members = getMembersData({ initializeStorage: true });
    tableBody.innerHTML = '';

    if (!members.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'メンバー情報が登録されていません。';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    members.forEach((member) => {
      const row = document.createElement('tr');

      const photoCell = document.createElement('td');
      if (member.photoUrl) {
        const img = document.createElement('img');
        img.src = member.photoUrl;
        img.alt = `${member.name}の写真`;
        img.className = 'admin-table__thumbnail';
        photoCell.appendChild(img);
      } else {
        photoCell.textContent = getInitials(member.name);
      }

      const nameCell = document.createElement('td');
      nameCell.textContent = member.name;

      const numberCell = document.createElement('td');
      numberCell.textContent = member.number;

      const positionCell = document.createElement('td');
      positionCell.textContent = member.position;

      const actionsCell = document.createElement('td');
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'table-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'button button--ghost';
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        editingId = member.id;
        form.memberId.value = member.id;
        form.memberName.value = member.name;
        form.memberNumber.value = member.number;
        form.memberPosition.value = member.position;
        form.memberPhoto.value = member.photoUrl ?? '';
        form.memberBio.value = member.bio ?? '';
        submitButton.textContent = 'メンバーを更新';
        cancelButton.hidden = false;
        message.textContent = '';
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'button button--ghost';
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        const membersData = getMembersData({ initializeStorage: true }).filter((item) => item.id !== member.id);
        saveStorageArray(STORAGE_KEYS.members, membersData);
        refreshTable();
        renderMembersCards();
        message.textContent = 'メンバーを削除しました。';
      });

      actionsWrapper.append(editButton, deleteButton);
      actionsCell.appendChild(actionsWrapper);

      row.append(photoCell, nameCell, numberCell, positionCell, actionsCell);
      tableBody.appendChild(row);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const membersData = getMembersData({ initializeStorage: true });
    const payload = {
      id: editingId ?? generateId('m'),
      name: String(formData.get('memberName') ?? '').trim(),
      number: Number(formData.get('memberNumber')),
      position: String(formData.get('memberPosition') ?? '').trim(),
      photoUrl: String(formData.get('memberPhoto') ?? '').trim(),
      bio: String(formData.get('memberBio') ?? '').trim()
    };

    if (!payload.name || !payload.position || Number.isNaN(payload.number)) {
      message.textContent = '入力内容を確認してください。';
      return;
    }

    let nextMembers;
    if (editingId) {
      nextMembers = membersData.map((member) => (member.id === editingId ? payload : member));
    } else {
      nextMembers = [...membersData, payload];
    }

    saveStorageArray(STORAGE_KEYS.members, nextMembers);
    renderMembersCards();
    refreshTable();

    message.textContent = editingId ? 'メンバー情報を更新しました。' : 'メンバーを追加しました。';

    editingId = null;
    form.reset();
    submitButton.textContent = 'メンバーを追加';
    cancelButton.hidden = true;
  });

  cancelButton?.addEventListener('click', () => {
    editingId = null;
    form.reset();
    submitButton.textContent = 'メンバーを追加';
    cancelButton.hidden = true;
    message.textContent = '';
  });

  resetButton?.addEventListener('click', () => {
    resetMembersData();
    editingId = null;
    form.reset();
    submitButton.textContent = 'メンバーを追加';
    cancelButton.hidden = true;
    message.textContent = 'デフォルトのメンバーデータに戻しました。';
    refreshTable();
    renderMembersCards();
  });

  refreshTable();
}

function setupGalleryAdmin() {
  const form = document.querySelector('[data-gallery-form]');
  const tableBody = document.querySelector('[data-gallery-table]');
  const message = document.querySelector('[data-gallery-message]');
  const submitButton = document.querySelector('[data-gallery-submit]');
  const cancelButton = document.querySelector('[data-gallery-cancel]');
  const resetButton = document.querySelector('[data-reset-gallery]');
  const fileInput = form.querySelector('[data-gallery-file]');

  if (!form || !tableBody || !submitButton) return;

  let editingId = null;

  function refreshTable() {
    const galleryItems = getGalleryData({ initializeStorage: true });
    tableBody.innerHTML = '';

    if (!galleryItems.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'ギャラリーが登録されていません。';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    galleryItems.forEach((item) => {
      const row = document.createElement('tr');

      const thumbCell = document.createElement('td');
      const thumbImg = document.createElement('img');
      thumbImg.src = item.imageUrl;
      thumbImg.alt = item.caption || 'ギャラリー画像';
      thumbImg.className = 'admin-table__thumbnail';
      thumbCell.appendChild(thumbImg);

      const captionCell = document.createElement('td');
      captionCell.textContent = item.caption ?? '';

      const actionsCell = document.createElement('td');
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'table-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'button button--ghost';
      editButton.textContent = '編集';
      editButton.addEventListener('click', () => {
        editingId = item.id;
        form.galleryId.value = item.id;
        form.galleryImage.value = item.imageUrl;
        form.galleryCaption.value = item.caption ?? '';
        if (fileInput) {
          fileInput.value = '';
        }
        submitButton.textContent = 'ギャラリーを更新';
        cancelButton.hidden = false;
        message.textContent = '';
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'button button--ghost';
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        const galleryData = getGalleryData({ initializeStorage: true }).filter((data) => data.id !== item.id);
        saveStorageArray(STORAGE_KEYS.gallery, galleryData);
        refreshTable();
        renderGallery();
        message.textContent = 'ギャラリー項目を削除しました。';
      });

      actionsWrapper.append(editButton, deleteButton);
      actionsCell.appendChild(actionsWrapper);

      row.append(thumbCell, captionCell, actionsCell);
      tableBody.appendChild(row);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    message.textContent = '';

    const galleryData = getGalleryData({ initializeStorage: true });
    const caption = String(formData.get('galleryCaption') ?? '').trim();
    let imageUrl = '';

    const file = fileInput?.files?.[0] ?? null;
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.textContent = '画像ファイルを選択してください。';
        return;
      }
      try {
        imageUrl = await readFileAsDataUrl(file);
      } catch (error) {
        console.warn(error);
        message.textContent = 'ファイルの読み込みに失敗しました。';
        return;
      }
    } else {
      imageUrl = String(formData.get('galleryImage') ?? '').trim();
    }

    if (!imageUrl || !caption) {
      message.textContent = '画像URLまたはファイルとキャプションを入力してください。';
      return;
    }

    const payload = {
      id: editingId ?? generateId('g'),
      imageUrl,
      caption
    };

    let nextGallery;
    if (editingId) {
      nextGallery = galleryData.map((item) => (item.id === editingId ? payload : item));
    } else {
      nextGallery = [...galleryData, payload];
    }

    saveStorageArray(STORAGE_KEYS.gallery, nextGallery);
    renderGallery();
    refreshTable();

    message.textContent = editingId ? 'ギャラリーを更新しました。' : 'ギャラリー画像を追加しました。';

    editingId = null;
    form.reset();
    if (fileInput) {
      fileInput.value = '';
    }
    submitButton.textContent = 'ギャラリー画像を追加';
    cancelButton.hidden = true;
  });

  cancelButton?.addEventListener('click', () => {
    editingId = null;
    form.reset();
    if (fileInput) {
      fileInput.value = '';
    }
    submitButton.textContent = 'ギャラリー画像を追加';
    cancelButton.hidden = true;
    message.textContent = '';
  });

  resetButton?.addEventListener('click', () => {
    resetGalleryData();
    editingId = null;
    form.reset();
    if (fileInput) {
      fileInput.value = '';
    }
    submitButton.textContent = 'ギャラリー画像を追加';
    cancelButton.hidden = true;
    message.textContent = 'デフォルトのギャラリーデータに戻しました。';
    refreshTable();
    renderGallery();
  });

  refreshTable();
}

function setupInquiryAdmin() {
  const tableBody = document.querySelector('[data-inquiry-table]');
  const emptyState = document.querySelector('[data-inquiry-empty]');
  const messageEl = document.querySelector('[data-inquiry-message]');

  if (!tableBody || !emptyState) return;

  function refreshTable() {
    const inquiries = getInquiriesData({ initializeStorage: true });
    tableBody.innerHTML = '';

    if (!inquiries.length) {
      emptyState.hidden = false;
      if (messageEl) {
        messageEl.textContent = '';
      }
      return;
    }

    emptyState.hidden = true;
    const ordered = [...inquiries].reverse();

    ordered.forEach((inquiry) => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      dateCell.textContent = inquiry.submittedAt ?? '';

      const nameCell = document.createElement('td');
      nameCell.textContent = inquiry.name ?? '';

      const emailCell = document.createElement('td');
      if (inquiry.email) {
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${inquiry.email}`;
        emailLink.textContent = inquiry.email;
        emailLink.rel = 'noopener';
        emailCell.appendChild(emailLink);
      }

      const messageCell = document.createElement('td');
      const displayText = truncateText(inquiry.message, 70);
      messageCell.textContent = displayText;
      if (inquiry.message) {
        messageCell.title = inquiry.message;
      }

      const actionsCell = document.createElement('td');
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'table-actions';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'button button--ghost';
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        const inquiriesData = getInquiriesData({ initializeStorage: true }).filter((item) => item.id !== inquiry.id);
        saveStorageArray(STORAGE_KEYS.inquiries, inquiriesData);
        refreshTable();
        if (messageEl) {
          messageEl.textContent = 'お問い合わせを削除しました。';
        }
      });

      actionsWrapper.appendChild(deleteButton);
      actionsCell.appendChild(actionsWrapper);

      row.append(dateCell, nameCell, emailCell, messageCell, actionsCell);
      tableBody.appendChild(row);
    });
  }

  refreshTable();
}

// ----- 初期化 -----
document.addEventListener('DOMContentLoaded', () => {
  const pageId = document.body.dataset.page;

  setupNavigation(pageId);
  setFooterYear();

  if (pageId === 'home') {
    renderGallery();
    setupGalleryModal();
    setupContactForm();
  }

  if (pageId === 'members') {
    renderMembersCards();
  }

  if (pageId === 'admin') {
    setupAdminLogin();
  }
});
