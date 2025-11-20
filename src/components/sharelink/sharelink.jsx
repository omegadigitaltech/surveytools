import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./sharelink.css";

import copy from "../../assets/img/copyicon.svg";
import wa from "../../assets/img/wa.svg";
import x from "../../assets/img/xicon.svg";
import fb from "../../assets/img/fb-color.svg";
import lin from "../../assets/img/in.svg";

import useAuthStore from "../../store/useAuthStore";
import config from "../../config/config";

const ShareLink = ({ type = "survey", formId, surveyId, onClose }) => {
  const { id } = useParams();
  const authToken = useAuthStore((state) => state.authToken);

  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);

  const entityId = formId || surveyId || id;
  const entityType = type || (formId ? "form" : "survey");

  useEffect(() => {
    const fetchShareLink = async () => {
      if (!entityId) return;

      try {
        setLoading(true);

        const endpoint =
          entityType === "form"
            ? `${config.API_URL}/forms/${entityId}`
            : `${config.API_URL}/surveys/${entityId}/info`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const link =
            data.shareLink || data.form?.shareLink || data.survey?.shareLink;

          if (link) {
            setShareLink(link);
          } else {
            const baseUrl = window.location.origin;
            const path =
              entityType === "form"
                ? `/answerform/${entityId}`
                : `/answersurvey/${entityId}`;

            setShareLink(`${baseUrl}${path}`);
          }
        }
      } catch (error) {
        console.error("Error fetching share link:", error);
        const baseUrl = window.location.origin;
        const path =
          entityType === "form"
            ? `/answerform/${entityId}`
            : `/answersurvey/${entityId}`;

        setShareLink(`${baseUrl}${path}`);
      } finally {
        setLoading(false);
      }
    };

    fetchShareLink();
  }, [entityId, entityType, authToken]);

  const copyToClipboard = () => {
    if (!shareLink) return toast.error("No link available to copy");
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!");
  };

  const shareOnSocialMedia = (platform) => {
    if (!shareLink) {
      toast.error("No link available to share");
      return;
    }

    const encodedLink = encodeURIComponent(shareLink);
    const text = encodeURIComponent(`Check out this ${entityType}!`);

    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${text}%20${encodedLink}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedLink}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div
      className="logout-box"
      onClick={(e) => {
        // Close modal when clicking on the overlay (logout-box)
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="share-box flex" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button
          className="close-share-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) {
              onClose();
            }
          }}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#666",
            padding: "0.25rem 0.5rem",
            lineHeight: "1",
            zIndex: 1002,
          }}
        >
          ✕
        </button>

        <h2 className="share-title">Share your link</h2>

        <div className="share-link flex">
          <span className="gen-link">
            {loading ? "Loading..." : shareLink || "No link available"}
          </span>

          <img
            src={copy}
            alt="Copy"
            onClick={copyToClipboard}
            style={{ cursor: "pointer" }}
          />
        </div>

        <h2 className="share-title">OR</h2>
        <p>Share via:</p>

        <div className="share-icons flex">
          <img
            src={wa}
            alt="WhatsApp"
            onClick={() => shareOnSocialMedia("whatsapp")}
            style={{ cursor: "pointer" }}
          />

          <img
            src={x}
            alt="Twitter/X"
            onClick={() => shareOnSocialMedia("twitter")}
            style={{ cursor: "pointer" }}
          />

          <img
            src={fb}
            alt="Facebook"
            onClick={() => shareOnSocialMedia("facebook")}
            style={{ cursor: "pointer" }}
          />

          <img
            src={lin}
            className="link-in"
            alt="LinkedIn"
            onClick={() => shareOnSocialMedia("linkedin")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
