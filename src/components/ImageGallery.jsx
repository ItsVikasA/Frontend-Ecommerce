import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { getAllFiles, getCakeImages } from '../services/imagekitService';
import './ImageGallery.css';

const ImageGallery = ({ showOnlyCakes = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Masonry breakpoint configuration
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 2
  };

  // Shuffle array for better distribution
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = showOnlyCakes ? await getCakeImages() : await getAllFiles();
        // Shuffle images for better masonry distribution
        const shuffledData = shuffleArray(data);
        setImages(shuffledData);
      } catch (err) {
        console.error('Failed to load images:', err);
        setError('Failed to load images. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [showOnlyCakes]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-error">
        <p>{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No images found.</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <div className="gallery-header">
        <h2>{showOnlyCakes ? 'Our Cake Collection' : 'Explore'}</h2>
        <p className="gallery-count">{images.length} images</p>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="gallery-masonry-grid"
        columnClassName="gallery-masonry-column"
      >
        {images.map((image) => (
          <div 
            key={image.id} 
            className="gallery-item"
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image.url} 
              alt={image.fileName}
              loading="lazy"
            />
            <div className="gallery-item-overlay">
              <h3>{image.fileName}</h3>
              <p>{(image.fileSize / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <img src={selectedImage.url} alt={selectedImage.fileName} />
            <div className="modal-info">
              <h3>{selectedImage.fileName}</h3>
              <p><strong>Type:</strong> {selectedImage.fileType}</p>
              <p><strong>Size:</strong> {(selectedImage.fileSize / 1024).toFixed(2)} KB</p>
              {selectedImage.width && selectedImage.height && (
                <p><strong>Dimensions:</strong> {selectedImage.width} x {selectedImage.height}</p>
              )}
              <p><strong>Path:</strong> {selectedImage.filePath}</p>
              <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="view-original">
                View Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
