import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { licensedUsersApiRef } from '../api/LicensedUsersClient';

function DownloadCSVLink() {
  const licensedUsersClient = useApi(licensedUsersApiRef);
  const handleDownload = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.preventDefault(); // Prevent the default link behavior

    try {
      const response = await licensedUsersClient.downloadStatistics();

      if (response.ok) {
        // Get the CSV data as a string
        const csvData = await response.text();

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'licensed-users.csv';
        document.body.appendChild(a);
        a.click();

        // Clean up the temporary link and object URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error(
          'Failed to download the csv file with list licensed users',
          response.statusText,
        );
      }
    } catch (error) {
      console.error('Error during the download:', error);
    }
  };

  return (
    <a href="/download-csv" onClick={handleDownload}>
      Download the list of recorded licensed users
    </a>
  );
}

export default DownloadCSVLink;
