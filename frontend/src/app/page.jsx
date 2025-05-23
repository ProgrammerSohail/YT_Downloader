import DownloadForm from '../components/DownloadForm';
import VideoInfoDisplay from '../components/VideoInfoDisplay';
import DownloadStatusDisplay from '../components/DownloadStatusDisplay'; // New import

export default function Home() {
  return (
    <>
     
      <main className='pt-32 pd:mt-20 lg:pt-0 min-h-[100dvh]' >
        <DownloadForm /> {/* Use the new DownloadForm component */}
        <VideoInfoDisplay /> {/* Use the new VideoInfoDisplay component */}
        {/* <DownloadStatusDisplay /> */}
         {/* Use the new DownloadStatusDisplay component */}
      </main>
    </>
  );
}
