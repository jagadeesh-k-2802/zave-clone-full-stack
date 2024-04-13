// Mobile Menu Button
const menu = document.getElementById('menu');

if (menu) {
  const dropdownMenu = document.getElementById('dropdown-menu');

  menu.addEventListener('click', () => {
    menu.classList.toggle('show');
    dropdownMenu.classList.toggle('show');
  });
}

// Hide FAB When Scrolled To Bottom
const fab = document.getElementById('fab');

if (fab) {
  window.onscroll = e => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      fab.classList.add('hide');
      setTimeout(() => (fab.style.visibility = 'hidden'), 250);
    } else {
      fab.style.visibility = 'visible';
      fab.classList.remove('hide');
    }
  };
}

// List, Grid Layouts
const layoutGrid = document.getElementById('layout-grid');
const layoutList = document.getElementById('layout-list');

if (layoutGrid && layoutList) {
  const listener = async function () {
    if (!this.classList.contains('active')) {
      const value = this.id.split('-')[1];

      try {
        const res = await fetch('/preferences/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'layout', value })
        });

        const json = await res.json();

        if (!json.success || res.status != 200) {
          throw Error(json.error || 'Something went wrong!');
        }

        this.classList.add('active');
        window.location.reload();
      } catch (err) {
        alert(err);
      }
    }
  };

  layoutGrid.addEventListener('click', listener);
  layoutList.addEventListener('click', listener);
}

// Dropdowns
const dropdownTriggers = document.getElementsByClassName('dropdown-trigger');

if (dropdownTriggers) {
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const listener = e => {
    windowHeight = e.target.innerHeight;
    windowWidth = e.target.innerWidth;
  };

  window.addEventListener('resize', listener);

  Array.from(dropdownTriggers).forEach(dropdown => {
    dropdown.addEventListener('click', function (e) {
      const overlay = document.getElementById(this.dataset.overlay);
      const dropdown = document.getElementById(this.dataset.dropdown);
      const isShowing = this.dataset.isshowing;
      const menuWidth = +this.dataset.width;
      const menuHeight = +this.dataset.height;
      const includeScroll = this.dataset.includescroll === 'true';

      if (isShowing === 'false') {
        const coords = [e.clientX, e.clientY + 40];

        if (includeScroll) {
          coords[1] = coords[1] + window.scrollY - 5;
        }

        if (windowWidth - coords[0] < menuWidth) {
          dropdown.style.left = `${windowWidth - menuWidth - 35}px`;
        } else {
          dropdown.style.left = `${coords[0]}px`;
        }

        dropdown.style.top = `${coords[1]}px`;

        // if (windowHeight - coords[1] < menuHeight) {
        //   dropdown.style.top = `${windowHeight - menuHeight}px`;
        // } else {
        //   dropdown.style.top = `${coords[1]}px`;
        // }

        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        overlay.style.display = 'block';
        this.dataset.isshowing = 'true';
      } else {
        dropdown.style.opacity = '0';
        setTimeout(() => (dropdown.style.visibility = 'hidden'), 250);
        overlay.style.display = 'none';
        this.dataset.isshowing = 'false';
      }
    });
  });
}

// Modals
const modalTriggers = document.getElementsByClassName('modal-trigger');

if (modalTriggers) {
  Array.from(modalTriggers).forEach(modal => {
    modal.addEventListener('click', function () {
      const modal = document.getElementById(this.dataset.modal);

      modal.style.visibility = 'visible';
      modal.style.opacity = '1';

      const listener = e => {
        if (e.target.className === 'modal-overlay') {
          modal.style.opacity = '0';
          setTimeout(() => (modal.style.visibility = 'hidden'), 250);
        }
      };

      modal.onclick = listener;
    });
  });
}

// Close Modals

const closeModals = document.getElementsByClassName('close-modal');

if (closeModals) {
  Array.from(closeModals).forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = document.getElementById(this.dataset.modal);
      modal.click();
    });
  });
}

// Copy Buttons
try {
  new ClipboardJS('.copy-link');
} catch (err) {}

// Show modals based on Query Params
const urlParams = new URLSearchParams(window.location.search);
const queryStatus = urlParams.get('status');

if (queryStatus) {
  window.history.pushState({}, document.title, window.location.pathname);

  const initModal = modal => {
    if (!modal) {
      return;
    }

    modal.style.visibility = 'visible';
    modal.style.opacity = '1';

    const listener = e => {
      if (e.target.className === 'modal-overlay') {
        modal.style.opacity = '0';
        setTimeout(() => (modal.style.visibility = 'hidden'), 250);
      }
    };

    modal.onclick = listener;
  };

  if (queryStatus === 'new') {
    initModal(document.getElementById('new-to-zave-overlay'));
  }

  if (queryStatus === 'tour') {
    initModal(document.getElementById('start-tour-overlay'));
  }

  const startTourBtns = document.getElementsByClassName('start-tour-btn');

  if (startTourBtns) {
    Array.from(startTourBtns).forEach(btn => {
      btn.addEventListener('click', () => {
        if (queryStatus === 'new') {
          document.getElementById('new-to-zave-overlay').click();
        }

        if (queryStatus === 'tour') {
          document.getElementById('start-tour-overlay').click();
        }

        initModal(document.getElementById('tour-slider-overlay'));
      });
    });
  }
}

// Tour Slick Carousel
const tourSlick = $('#tour-slick');

if (tourSlick.length > 0) {
  const sliderNav = document.querySelector('.slider-nav');
  const sliderFinishTour = document.querySelector('.slider-finish-tour');
  const LAST_SLIDE = 4;

  tourSlick.slick({
    dots: true,
    infinite: false,
    speed: 500,
    fade: true,
    cssEase: 'linear',
    prevArrow: '<span class="slick-prev">Previous</span>',
    nextArrow: '<span class="slick-next">Next</span>',
    appendArrows: '.slider-nav',
    appendDots: '.slider-pagination'
  });

  // On edge hit
  tourSlick.on('beforeChange', (_e, _slick, _currentSlide, nextSlide) => {
    if (nextSlide === LAST_SLIDE) {
      sliderNav.style.display = 'none';
      sliderFinishTour.style.display = 'block';
    } else {
      sliderFinishTour.style.display = 'none';
      sliderNav.style.display = 'block';
    }
  });
}

// Minicolors
const miniColorsInput = $('#minicolors-input');
const miniColorsInput2 = $('#minicolors-input-edit');

if (miniColorsInput.length > 0) {
  // Create Group Modal
  miniColorsInput.minicolors({
    position: 'top left',
    defaultValue: '#c6c6c6',
    format: 'hex',
    change: () => {
      const previousSelected = $('#create-color-blocks a.selected')[0];
      previousSelected && previousSelected.classList.remove('selected');
      $('#create-color-blocks #minicolors-input')[0].classList.add('selected');
      $('#create-color-blocks .minicolors-swatch-color')[0].classList.add(
        'selected'
      );
    }
  });

  // Edit Group Modal
  miniColorsInput2.minicolors({
    position: 'top left',
    defaultValue: '#c6c6c6',
    format: 'hex',
    change: () => {
      const previousSelected = $('#edit-color-blocks a.selected')[0];
      previousSelected && previousSelected.classList.remove('selected');
      $('#edit-color-blocks #minicolors-input-edit')[0].classList.add('selected');
      $('#edit-color-blocks .minicolors-swatch-color')[0].classList.add(
        'selected'
      );
    }
  });

  // Create Group Modal
  $('#create-color-blocks a').click(e => {
    $('#create-color-blocks a.selected')[0].classList.remove('selected');
    e.target.classList.add('selected');
  });

  // Edit Group Modal
  $('#edit-color-blocks a').click(e => {
    $('#edit-color-blocks a.selected')[0].classList.remove('selected');
    e.target.classList.add('selected');
  });
}
