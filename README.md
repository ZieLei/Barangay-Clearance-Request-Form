# Barangay Clearance Request Form

A retro-styled barangay clearance request form built with Angular Reactive Forms. It validates each field, previews the request as you type, and reports the form's status in a live banner.

## Features

- **Collect** a full name, birthdate, address, contact number and purpose of request.
- **Require** every field, and **validate** the contact number against the `09XXXXXXXXX` format with a custom validator.
- **Reveal** a required "Specify purpose" field only when the purpose is "Others" (driven by `valueChanges`).
- **Preview** the request in a live card that updates as you type.
- **Show** a status banner that reacts to `statusChanges` (valid, invalid or pending).
- **Confirm** the request in a modal before submitting.
- **Switch** between light and dark themes. The choice is saved and defaults to your system preference.

## Tech Stack

- [Angular](https://angular.dev) 22 (standalone components, signals, Reactive Forms)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Pixelarticons](https://pixelarticons.com) for icons
- Gruvbox color palette
- Space Mono, Space Grotesk and Fraunces fonts (bundled, SIL OFL)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (a version supported by Angular 22)
- npm

### Install

```bash
git clone https://github.com/ZieLei/Barangay-Clearance-Request-Form.git
cd Barangay-Clearance-Request-Form
npm install
```

### Run

```bash
npm start
```

Open `http://localhost:4200/`. The app reloads whenever you change a source file.

### Build

```bash
npm run build
```

The build output lands in `dist/barangay-clearance/`.

### Test

```bash
npm test
```

## Project Structure

```text
src/
├── app/
│   ├── app.ts / app.html        # Form, preview card, status banner, theme toggle
│   ├── components/
│   │   ├── confirm-modal/       # Submit confirmation dialog
│   │   ├── date-picker/         # Birthdate picker (ControlValueAccessor)
│   │   └── select/              # Purpose dropdown (ControlValueAccessor)
│   └── validators/
│       └── ph-mobile.validator.ts   # 09XXXXXXXXX validator
├── assets/fonts/                # Bundled fonts and their licenses
└── styles.css                   # Gruvbox theme tokens and retro UI utilities
```

## How It Works

| Requirement | Implementation |
| --- | --- |
| Required fields | `Validators.required` on every control |
| Contact number format | `phMobileValidator()` accepts `09` followed by nine digits |
| "Others" purpose | `purpose.valueChanges` enables and requires `otherPurpose`, and disables and clears it for any other choice |
| Live preview | A signal built from `form.valueChanges` feeds the preview card |
| Status banner | A signal built from `form.statusChanges` selects the banner message |

## Contributing

Fork the repository, create a branch, commit your changes and open a pull request.
