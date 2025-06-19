// =========================
// RRwisdomhomes Main Script
// =========================
// This script handles section animations, cost comparison, mobile navigation, and form validation for the RRwisdomhomes website.
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Select all sections for intersection observer animations
  const sections = document.querySelectorAll('section');

  // Make first section visible by default for initial page load
  if (sections.length > 0) {
    sections[0].classList.add('visible');
  }

  // Intersection Observer to animate sections as they enter the viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px'
  });

  // Observe all sections except the first one (already visible)
  sections.forEach((section, index) => {
    if (index > 0) {
      observer.observe(section);
    }
  });

  // =============================
  // Cost Comparison Table Effects
  // =============================
  const costComparisonSection = document.querySelector('.cost-comparison');
  const comparisonRows = document.querySelectorAll('.comparison-row');

  // Animates a number from 0 to target in a visually appealing way
  function animateNumber(element, target, duration) {
    let start = 0;
    let startTime = null;

    // Easing function for smooth animation
    function easeOutCubic(t) {
      return (--t) * t * t + 1;
    }

    // Animation frame step
    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const value = Math.floor(easedProgress * target);
      element.textContent = '$' + value.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // Sequentially animates each row in the cost comparison table
  function startComparisonAnimations() {
    comparisonRows.forEach((row, index) => {
      setTimeout(() => {
        row.classList.add('visible');
        const animatedNumberCell = row.querySelector('.animated-number');
        if (animatedNumberCell) {
          const targetNumber = parseInt(animatedNumberCell.dataset.target);
          animateNumber(animatedNumberCell, targetNumber, 1500); // 1.5 seconds animation
        }
      }, index * 400); // Stagger by 0.4 seconds for a cascading effect
    });
  }

  // Observe the cost comparison section to trigger animation on scroll
  const comparisonObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startComparisonAnimations();
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, { 
    threshold: 0.2 // Trigger when 20% of the section is visible
  });

  if (costComparisonSection) {
    comparisonObserver.observe(costComparisonSection);
  }

  // =====================
  // Mobile Navigation UI
  // =====================
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNavMenu = document.querySelector('.mobile-nav-menu');
  const mainNavLinks = document.querySelectorAll('.main-nav a');

  // Toggle mobile navigation menu visibility
  if (mobileNavToggle && mobileNavMenu && mainNavLinks) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavToggle.classList.toggle('active');
      mobileNavMenu.classList.toggle('active');
    });

    // Close mobile menu when a navigation link is clicked
    mainNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavToggle.classList.remove('active');
        mobileNavMenu.classList.remove('active');
      });
    });
  }

  // =====================
  // Form Validation Logic
  // =====================
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    const emailInput = form.querySelector('input[type="email"]');

    // Show an error message for invalid input
    function showErrorMessage(input, message) {
      const errorMessageDiv = input.nextElementSibling;
      if (errorMessageDiv && errorMessageDiv.classList.contains('error-message')) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.add('visible');
        input.classList.remove('valid');
        input.classList.add('invalid');
      }
    }

    // Hide the error message and mark input as valid
    function hideErrorMessage(input) {
      const errorMessageDiv = input.nextElementSibling;
      if (errorMessageDiv && errorMessageDiv.classList.contains('error-message')) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.classList.remove('visible');
        input.classList.remove('invalid');
        input.classList.add('valid');
      }
    }

    // Validate input fields (email and required fields)
    function validateInput(input) {
      if (input.type === 'email') {
        if (!input.value.includes('@') || !input.value.includes('.')) {
          showErrorMessage(input, 'Please enter a valid email address.');
          return false;
        }
      } else if (input.value.trim() === '') {
        showErrorMessage(input, 'This field is required.');
        return false;
      }
      hideErrorMessage(input);
      return true;
    }

    // Attach validation listeners to each input
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        validateInput(input);
      });
      input.addEventListener('blur', () => {
        validateInput(input);
      });
    });

    // Handle form submission with validation and async POST
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default HTML form submission

      const submitButton = form.querySelector('button[type="submit"]');
      const loadingIndicator = form.querySelector('.loading-indicator');
      const statusMessage = form.querySelector('.status-message');

      let formIsValid = true;
      inputs.forEach(input => {
        if (!validateInput(input)) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        statusMessage.textContent = 'Please correct the errors above.';
        statusMessage.classList.remove('success');
        statusMessage.classList.add('error', 'visible');
        return; // Stop submission if validation fails
      }

      // Show loading indicator and disable button during async request
      loadingIndicator.style.display = 'block';
      statusMessage.style.display = 'none';
      submitButton.disabled = true;

      const formData = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      })
      .then(response => {
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
        if (response.ok) {
          statusMessage.textContent = 'Your message has been sent successfully!';
          statusMessage.classList.remove('error');
          statusMessage.classList.add('success', 'visible');
          form.reset(); // Clear the form
          inputs.forEach(input => {
            input.classList.remove('valid', 'invalid'); // Clear validation styles
            hideErrorMessage(input);
          });
        } else {
          return response.json().then(data => {
            throw new Error(data.message || 'Oops! There was a problem submitting your form.');
          });
        }
      })
      .catch(error => {
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
        statusMessage.textContent = error.message;
        statusMessage.classList.remove('success');
        statusMessage.classList.add('error', 'visible');
      });
    });
  });
});

// NOTE: For best performance, use a lower-resolution version of your video (e.g., 720p or lower) as 'real_estate_video.mp4'.
// If you have multiple sources, you can add a <source> with a lower-res video for mobile devices.