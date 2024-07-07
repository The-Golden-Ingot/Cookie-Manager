# Cookie Manager

## Overview

Cookie Manager is a Chrome extension designed to help users manage and apply cookies with a draggable interface. This extension allows users to save, import, export, and apply different cookie profiles for various websites.

**Note:** This project is currently in beta. Features may be incomplete or unstable, and things can be broken.

## Features

- **Save Cookies**: Save the current cookies of the active tab as a profile.
- **Import Profiles**: Import cookie profiles from a JSON file.
- **Export Profiles**: Export saved cookie profiles to a JSON file.
- **Apply Profiles**: Apply saved cookie profiles to the current tab.
- **Draggable Interface**: Easily manage profiles with a draggable interface.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/the-golden-ingot/cookie-manager.git
    ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click "Load unpacked" and select the cloned repository folder.

## Usage

### Saving Cookies

1. Click the extension icon to open the Cookie Manager.
2. Click the "Save Cookies" button to save the current cookies of the active tab.
3. Enter a name for the new profile when prompted.

### Importing Profiles

1. Click the extension icon to open the Cookie Manager.
2. Click the "Import Profiles" button.
3. Choose a JSON file containing the profiles to import.

### Exporting Profiles

1. Right-click the extension icon and select "Export Profiles" from the context menu.
2. The profiles will be downloaded as a JSON file.

### Applying Profiles

1. Click the extension icon to open the Cookie Manager.
2. Click on a saved profile to apply its cookies to the current tab.

## File Structure

- `manifest.json`: Defines the extension's metadata, permissions, and background scripts.
- `background.js`: Handles background tasks such as context menu creation and message passing.
- `popup.js`: Manages the UI interactions and profile operations.
- `styles.css`: Contains the styles for the extension's UI.
- `iframe.html`: The main HTML file for the extension's popup.
- `import.html`: HTML file for importing profiles.
- `options.html`: HTML file for extension options.
- `draggable.bundle.js`: A library for creating draggable elements.
- `icons/`: Directory containing various icons used in the extension.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or feedback, please contact the repository owner.

---

Enjoy managing your cookies with ease!
