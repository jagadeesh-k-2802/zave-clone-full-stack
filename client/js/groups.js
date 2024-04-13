const createGroupForm = document.getElementById('create-group-form');
const editGroupForm = document.getElementById('edit-group-form');
const addNewForm = document.getElementById('add-new-form');
const newCardForm = document.getElementById('new-card-form');
const deleteCardForm = document.getElementById('delete-card-form');
const editCardForm = document.getElementById('edit-card-form');
const groupVisibilityTogglers = $('.toggle-group-visbility');
const deleteGroupBtns = $('.delete-group-btn');
const editGroupBtns = $('.edit-group-btn');
const editModeBtns = $('.edit-mode-btn');
const newCardBtns = $('.new-card-btn');
const deleteCardBtns = $('.delete-card-btn');
const editCardBtns = $('.edit-card-btn');

// Create Group Form
if (createGroupForm) {
  createGroupForm.addEventListener('submit', async e => {
    e.preventDefault();

    const object = {
      name: createGroupForm.querySelector('#group-name').value,
      color: createGroupForm.querySelector('.selected').getAttribute('value')
    };

    try {
      const res = await fetch('/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

// Toggle Group Visibility
groupVisibilityTogglers.click(async e => {
  const { id, value } = e.target.dataset;
  const object = { groupVisibility: value === 'hidden' ? 'visible' : 'hidden' };

  try {
    const res = await fetch(`/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(object)
    });

    const json = await res.json();

    if (!json.success || res.status != 200) {
      throw Error(json.error || 'Something went wrong!');
    }

    window.location.reload();
  } catch (err) {
    alert(err);
  }
});

// Delete Group Btns
deleteGroupBtns.click(async e => {
  const { id } = e.target.dataset;

  try {
    const res = await fetch(`/groups/${id}`, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (!json.success || res.status != 200) {
      throw Error(json.error || 'Something went wrong!');
    }

    window.location.reload();
  } catch (err) {
    alert(err);
  }
});

// Edit Group Btns
editGroupBtns.click(async e => {
  const editGroupOverlay = $('#edit-group-overlay')[0];
  const { id, name, color } = e.target.dataset;

  // Set Data
  const editGroupForm = document.getElementById('edit-group-form');
  const groupName = editGroupForm.querySelector('#group-name-edit');
  const groupId = editGroupForm.querySelector('#group-id-edit');

  groupName.value = name;
  groupId.value = id;

  const previousSelected = $('#edit-color-blocks a.selected')[0];
  previousSelected && previousSelected.classList.remove('selected');

  const toBeSelected = document.getElementById(color);
  toBeSelected && toBeSelected.classList.add('selected');

  editGroupOverlay.style.visibility = 'visible';
  editGroupOverlay.style.opacity = '1';

  const listener = e => {
    if (e.target.className === 'modal-overlay') {
      editGroupOverlay.style.opacity = '0';
      setTimeout(() => (editGroupOverlay.style.visibility = 'hidden'), 250);
    }
  };

  editGroupOverlay.onclick = listener;
});

// New Card Btns
newCardBtns.click(async e => {
  const newCardOverlay = $('#new-card-overlay')[0];
  const { id } = e.target.dataset;

  // Set Data
  const newCardForm = document.getElementById('new-card-form');
  const groupId = newCardForm.querySelector('#selected-group-new');

  groupId.value = id;
  newCardOverlay.style.visibility = 'visible';
  newCardOverlay.style.opacity = '1';

  const listener = e => {
    if (e.target.className === 'modal-overlay') {
      newCardOverlay.style.opacity = '0';
      setTimeout(() => (newCardOverlay.style.visibility = 'hidden'), 250);
    }
  };

  newCardOverlay.onclick = listener;
});

// Edit Group Form
if (editGroupForm) {
  editGroupForm.addEventListener('submit', async e => {
    e.preventDefault();

    const id = editGroupForm.querySelector('#group-id-edit').value;

    const object = {
      name: editGroupForm.querySelector('#group-name-edit').value,
      color: editGroupForm.querySelector('.selected').getAttribute('value')
    };

    try {
      const res = await fetch(`/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

// Add New Form (Generic Modal)
if (addNewForm) {
  addNewForm.addEventListener('submit', async e => {
    e.preventDefault();
    const url = addNewForm.querySelector('#url').value;
    const selectedGroupId = addNewForm.querySelector('#selected-group').value;

    try {
      const res = await fetch(`/groups/${selectedGroupId}/add-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

if (newCardForm) {
  newCardForm.addEventListener('submit', async e => {
    e.preventDefault();

    const url = newCardForm.querySelector('#url-new').value;
    const selectedGroupId = newCardForm.querySelector('#selected-group-new')
      .value;

    try {
      const res = await fetch(`/groups/${selectedGroupId}/add-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

if (editModeBtns.length > 0) {
  const bottomEditModeBar = document.getElementById('bottom-edit-mode-bar');

  editModeBtns.click(async e => {
    const element = document.getElementById(e.target.dataset.elementid);
    const groupName = e.target.dataset.groupname;

    // Show Edit Mode class
    element.classList.add('edit-mode');

    // Show BottomBar With Right Group Name
    bottomEditModeBar.style.visibility = 'visible';
    bottomEditModeBar.querySelector('#group-name').innerHTML = groupName;
    bottomEditModeBar.style.opacity = '1';

    const resetEverything = () => {
      bottomEditModeBar.style.visibility = 'hidden';
      bottomEditModeBar.style.opacity = '0';
      element.classList.remove('edit-mode');
    };

    // Buttons
    bottomEditModeBar.querySelector('#cancel-btn').onclick = resetEverything;
    bottomEditModeBar.querySelector('#save-btn').onclick = resetEverything;
  });
}

if (deleteCardForm) {
  deleteCardForm.addEventListener('submit', async e => {
    e.preventDefault();
    const groupId = deleteCardForm.querySelector('#group-id').value;
    const cardId = deleteCardForm.querySelector('#card-id').value;

    try {
      const res = await fetch(`/groups/${groupId}/delete-card/${cardId}`, {
        method: 'DELETE'
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

// Inject Id's When About to delete a card
if (deleteCardBtns.length > 0) {
  deleteCardBtns.click(e => {
    const groupId = e.target.dataset.groupid;
    const cardId = e.target.dataset.cardid;

    deleteCardForm.querySelector('#group-id').value = groupId;
    deleteCardForm.querySelector('#card-id').value = cardId;
  });
}

if (editCardForm) {
  editCardForm.addEventListener('submit', async e => {
    e.preventDefault();
    const groupId = editCardForm.querySelector('#group-id-card-edit').value;
    const cardId = editCardForm.querySelector('#card-id-edit').value;
    const cardName = editCardForm.querySelector('#card-name').value;
    const cardURL = editCardForm.querySelector('#card-url').value;

    try {
      const res = await fetch(`/groups/${groupId}/edit-card/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cardName, url: cardURL })
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

// Inject Id's When About to edit a card
if (editCardBtns.length > 0) {
  editCardBtns.click(e => {
    const groupId = e.target.dataset.groupid;
    const cardId = e.target.dataset.cardid;
    const cardName = e.target.dataset.cardname;
    const cardURL = e.target.dataset.cardurl;

    editCardForm.querySelector('#group-id-card-edit').value = groupId;
    editCardForm.querySelector('#card-id-edit').value = cardId;
    editCardForm.querySelector('#card-name').value = cardName;
    editCardForm.querySelector('#card-url').value = cardURL;
  });
}
