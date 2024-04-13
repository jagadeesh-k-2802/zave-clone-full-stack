const extractFromInputs = (...inputs) => {
  const object = {};

  for (const input of inputs) {
    if (input.name === 'password' || input.name === 'new-password') {
      // Password should be > 6 chars
      if (input.value.length < 6) {
        if (!input.classList.contains('error')) {
          input.classList.add('error');
          input.insertAdjacentHTML(
            'afterend',
            '<p class="error">Password should be atleast 6 characters long</p>'
          );
        }
        return { error: true };
      } else {
        if (input.classList.contains('error')) {
          input.classList.remove('error');
          input.nextElementSibling.remove();
        }
      }
    }

    object[input.name] = input.value;
  }

  return object;
};

const dataURItoBlob = dataURI => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
};

const loginForm = document.getElementById('login-form');
const signUpForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const profileForm = document.getElementById('profile-form');
const updatePasswordForm = document.getElementById('update-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const requestDeleteForm = document.getElementById('request-delete-form');
const deleteAccountForm = document.getElementById('delete-account-form');
const profileVisibilityToggle = document.getElementById(
  'profile-visibility-toggle'
);
const slimCropper = document.getElementById('slim-cropper');

// Login Form
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const object = extractFromInputs(
      loginForm.querySelector('#email'),
      loginForm.querySelector('#password')
    );

    if (object.error) {
      return;
    }

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location = '/dashboard';
    } catch (err) {
      alert(err);
    }
  });
}

// Signup Form
if (signUpForm) {
  signUpForm.addEventListener('submit', async e => {
    e.preventDefault();

    const object = extractFromInputs(
      signUpForm.querySelector('#full-name'),
      signUpForm.querySelector('#username'),
      signUpForm.querySelector('#email'),
      signUpForm.querySelector('#password')
    );

    if (object.error) {
      return;
    }

    try {
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location = '/dashboard?status=new';
    } catch (err) {
      alert(err);
    }
  });
}

// Forgot Password Form
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const object = { email: forgotPasswordForm.querySelector('#email').value };

    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      alert('Reset link sent to your mail!');
    } catch (err) {
      alert(err);
    }
  });
}

// Profile Form
if (profileForm) {
  profileForm.addEventListener('submit', async e => {
    e.preventDefault();

    const fullname = profileForm.querySelector('#fullname').value;
    const username = profileForm.querySelector('#username').value;
    const bio = profileForm.querySelector('#bio').value.trim();
    const socialProfiles = {
      facebook: profileForm.querySelector('#facebook').value,
      twitter: profileForm.querySelector('#twitter').value,
      instagram: profileForm.querySelector('#instagram').value,
      producthunt: profileForm.querySelector('#producthunt').value
    };

    const object = { fullname, username, bio, socialProfiles };

    try {
      const res = await fetch('/auth/update-details', {
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

// Update Password Form
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const currentPassword = updatePasswordForm.querySelector(
      '#current-password'
    ).value;
    const newPassword = updatePasswordForm.querySelector('#new-password').value;

    const object = { currentPassword, newPassword };

    try {
      const res = await fetch('/auth/update-password', {
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

// Reset Password Form
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const newPassword = resetPasswordForm.querySelector('#new-password').value;
    const confirmPassword = resetPasswordForm.querySelector('#confirm-password')
      .value;
    const token = window.location.toString().split('/').slice(-1)[0];

    if (newPassword != confirmPassword) {
      return alert('Passwords do not match!');
    }

    try {
      const res = await fetch(`/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location = '/dashboard';
    } catch (err) {
      alert(err);
    }
  });
}

// Request Delete Form
if (requestDeleteForm) {
  requestDeleteForm.addEventListener('submit', async e => {
    e.preventDefault();

    try {
      const res = await fetch('/auth/request-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      alert('A mail was sent your email address!');
      window.location.reload();
    } catch (err) {
      alert(err);
    }
  });
}

// Delete Account Form
if (deleteAccountForm) {
  deleteAccountForm.addEventListener('submit', async e => {
    e.preventDefault();

    try {
      const res = await fetch('/auth/delete-account', { method: 'DELETE' });

      if (res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location = '/';
    } catch (err) {
      alert(err);
    }
  });
}

// Toggle Profile Visibility
if (profileVisibilityToggle) {
  const profileVisibleAt = document.getElementById('profile-visible-at');

  profileVisibilityToggle.addEventListener('click', async e => {
    const target = e.target;

    if (
      (target.id === 'profile-visible' || target.id === 'profile-hidden') &&
      !target.classList.contains('active')
    ) {
      const value = target.id.split('-')[1];

      if (value === 'hidden') {
        // Hide profile-visible-at
        profileVisibleAt.style.opacity = '0';
        target.classList.add('active');
        document.getElementById('profile-visible').classList.remove('active');
        setTimeout(() => (profileVisibleAt.style.display = 'none'), 250);
      } else {
        // Show profile-visible-at
        profileVisibleAt.style.display = 'block';
        setTimeout(() => (profileVisibleAt.style.opacity = '1'), 1);
        target.classList.add('active');
        document.getElementById('profile-hidden').classList.remove('active');
      }

      try {
        const res = await fetch('/auth/update-visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileVisibility: value })
        });

        const json = await res.json();

        if (!json.success || res.status != 200) {
          throw Error(json.error || 'Something went wrong!');
        }
      } catch (err) {
        alert(err);
      }
    }
  });
}

// Upload Avatar
if (slimCropper) {
  const saveAvatarBtn = document.querySelector('#save-avatar-btn');

  const cropper = new Slim(slimCropper, {
    ratio: '1:1',
    minSize: { width: 240, height: 240 },
    size: { width: 320, height: 320 },
    download: false,
    instantEdit: false,
    label: 'Drop your avatar here',
    buttonConfirmLabel: 'Confirm',
    buttonConfirmTitle: 'Confirm',
    buttonCancelLabel: 'Cancel',
    buttonCancelTitle: 'Cancel',
    buttonEditTitle: 'Edit',
    buttonRemoveTitle: 'Remove',
    buttonDownloadTitle: 'Download',
    buttonRotateTitle: 'Rotate',
    buttonUploadTitle: 'Upload',
    statusImageTooSmall: 'Image should be atleast $0 pixel.',
    willSave: () => {
      slimFileHopper.style = {};

      // Change Button State
      saveAvatarBtn.classList.remove('btn--primary');
      saveAvatarBtn.classList.add('btn--green');
      saveAvatarBtn.innerHTML = 'Save Changes';
    }
  });

  const slimFileHopper = slimCropper.querySelector('.slim-file-hopper');
  slimFileHopper.style = {};

  saveAvatarBtn.addEventListener('click', async e => {
    if (!e.target.classList.contains('btn--green')) {
      e.target.classList.remove('btn--primary');
      e.target.classList.add('btn--green');
      e.target.innerHTML = 'Save Changes';
      return slimFileHopper.click();
    }

    const base64 = cropper.dataBase64.output.image;
    const blob = dataURItoBlob(base64);
    const formData = new FormData();
    formData.append('avatar', blob);

    // Submit Avatar
    try {
      const res = await fetch('/auth/update-avatar', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (!json.success || res.status != 200) {
        throw Error(json.error || 'Something went wrong!');
      }

      window.location.reload();
    } catch (err) {
      alert(err);
    } finally {
      e.target.classList.remove('btn--green');
      e.target.classList.add('btn--primary');
      e.target.innerHTML = 'Change Avatar';
    }
  });
}
