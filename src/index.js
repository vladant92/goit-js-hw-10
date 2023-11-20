import axios from 'axios';
import Notiflix from 'notiflix';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.css';

axios.defaults.headers.common["x-api-key"] = "live_kkEzWPVqHzq7zAP5D19EiTDRSPJKpromOLumY5EdJLN2vxCAnhSN7Z7f45piOsXE";

document.addEventListener("DOMContentLoaded", function () {
  const breedSelect = document.querySelector(".breed-select");
  const catInfo = document.querySelector(".cat-info");

  // Initialize Choices.js for breedSelect
  const choices = new Choices(breedSelect, {
    placeholder: true,
    shouldSort: false,
    searchEnabled: false,
    allowHTML: true,
  });

  const style = document.createElement('style');
  style.textContent = `
    .choices {
      max-width: 250px;
      overflow: visible;
    }
    .choices__inner {
      min-height: auto;
      color: #E14523;
    }
    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid #FFF;
      border-bottom-color: #FF3D00;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
      }

      @keyframes rotation {
      0% {
          transform: rotate(0deg);
      }
      100% {
          transform: rotate(360deg);
      }
      }
  `;
  document.head.appendChild(style);


  breedSelect.addEventListener("change", function () {
    const selectedBreedId = this.value;

    if (selectedBreedId) {
      fetchCatByBreed(selectedBreedId);
    } else {
      document.querySelector(".cat-info").style.display = "none";
    }
  });

  fetchBreeds();

  function fetchBreeds() {
    const url = "https://api.thecatapi.com/v1/breeds";

    document.querySelector(".breed-select").style.display = "none";
    document.querySelector(".loader").style.display = "block";
    document.querySelector(".error").style.display = "none";

    axios.get(url)
      .then(response => {
        const breedSelect = document.querySelector(".breed-select");
        breedSelect.innerHTML = "";

        if (response.data.length === 0) {
          throw new Error("No cat breeds found.");
        }

        response.data.forEach((breed, index) => {
          const option = document.createElement("option");
          option.value = breed.id;
          option.textContent = breed.name;
          option.dataset.description = breed.description;
          option.dataset.temperament = breed.temperament;
          breedSelect.appendChild(option);

          if (index === 0) {
            option.selected = true;
          }
        });

        breedSelect.style.display = "block";
        document.querySelector(".loader").style.display = "none";

        // Refresh Choices.js after modifying options
        choices.setChoices(Array.from(breedSelect.options), 'value', 'label', true);

        return response.data;
      })
      .catch(error => {
        console.error("Error fetching breeds:", error);
        Notiflix.Notify.failure("Oops! Something went wrong! Try reloading the page!");
        document.querySelector(".loader").style.display = "none";
        throw new Error("Oops! Something went wrong! Try reloading the page!");
      });
  }

  function fetchCatByBreed(breedId) {
    const url = `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`;

    document.querySelector(".cat-info").style.display = "none";
    document.querySelector(".loader").style.display = "block";
    document.querySelector(".error").style.display = "none";

    axios.get(url)
      .then(response => {
        const catInfo = document.querySelector(".cat-info");
        const catData = response.data[0].breeds[0];

        if (!catData) {
          throw new Error("No information available for the selected breed.");
        }

        catInfo.innerHTML = `
          <div style="display: flex; margin-top: 20px;">
            <div style="flex: 0 0 30%; margin-right: 20px; align-self: flex-start;">
              <img src="${response.data[0].url}" alt="${catData.name}" style="width: 100%;" />
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start;">
              <p style="margin: 0; padding: 5px;"><strong>Breed:</strong><br> ${catData.name}</p>
              <p style="margin: 0; padding: 5px;"><strong>Description:</strong><br> ${catData.description}</p>
              <p style="margin: 0; padding: 5px;"><strong>Temperament:</strong><br> ${catData.temperament}</p>
            </div>
          </div>
        `;

        catInfo.style.display = "block";
        document.querySelector(".loader").style.display = "none";

        return catData;
      })
      .catch(error => {
        console.error("Error fetching cat by breed:", error);
        Notiflix.Notify.failure("Oops! Something went wrong! Try reloading the page!");
        document.querySelector(".loader").style.display = "none"; // Hide loader
        throw new Error("Oops! Something went wrong! Try reloading the page!");
      });
  }
});

document.querySelector(".error").addEventListener("click", function () {
  this.style.display = "none";
});