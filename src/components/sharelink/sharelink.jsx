import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./sharelink.css";
import done from "../../assets/img/done.png";
import copy from "../../assets/img/copyicon.svg";
import wa from "../../assets/img/wa.svg";
import x from "../../assets/img/xicon.svg";
import fb from "../../assets/img/fb-color.svg";

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
        } else {
          // fallback path if API returned non-ok
          const baseUrl = window.location.origin;
          const path =
            entityType === "form"
              ? `/answerform/${entityId}`
              : `/answersurvey/${entityId}`;

          setShareLink(`${baseUrl}${path}`);
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

  const copyToClipboard = (text = shareLink) => {
    if (!text) return toast.error("No link available to copy");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyEmbedCode = () => {
    if (!shareLink) return toast.error("No link available");
    const embed = `<iframe src="${shareLink}" title="Survey" style="width:100%;height:600px;border:0"></iframe>`;
    copyToClipboard(embed);
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
        // Close modal when clicking on the overlay
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="share-box publish-modal flex" onClick={(e) => e.stopPropagation()}>
        {/* Close button (top-right) */}
        <button
          className="close-share-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="publish-icon-wrap">
          <img src={done} alt="Done" className="publish-done-icon" />
        </div>

        <h2 className="publish-title">Form Published Successfully</h2>

        <div className="share-section">
          <label className="share-label">Share Your Form Link</label>
          <div className="share-link-row">
            <span className="gen-link">{loading ? "Loading..." : shareLink || "No link available"}</span>
            <button
              className="icon-btn"
              onClick={() => copyToClipboard(shareLink)}
              aria-label="Copy link"
              disabled={!shareLink}
            >
              <img src={copy} alt="Copy" />
            </button>
          </div>
        </div>

        <div className="share-section">
          <label className="share-label">HTML Embed Code</label>
          <div className="share-textarea-wrapper">
                      <textarea
            readOnly
            className="embed-code"
            value={
              shareLink
                ? `<iframe src="${shareLink}" title="Survey" style="width:100%;height:600px;border:0"></iframe>`
                : ""
            }
            rows={4}
          />
            <button
              className="copy-embed-btn"
              onClick={copyEmbedCode}
              disabled={!shareLink}
            >
              <img src={copy} alt="Copy" />

            </button>
          </div>
        </div>

        <div className="share-via">
          <p className="share-via-text">Share via:</p>
          <div className="share-icons flex">
            <img src={wa} alt="WhatsApp" onClick={() => shareOnSocialMedia("whatsapp")} />
            <img src={x} alt="Twitter/X" onClick={() => shareOnSocialMedia("twitter")} />
            <img src={fb} alt="Facebook" onClick={() => shareOnSocialMedia("facebook")} />
            <svg xmlns="http://www.w3.org/2000/svg" onClick={() => shareOnSocialMedia("linkedin")} height="20" width="20" viewBox="0 0 640 640"><path fill="#2095d3" d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"/></svg>
          </div>
        </div>

        {/* Done button (closes modal only) */}
        <div className="publish-footer">
          <button
            className="share-done-btn"
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
