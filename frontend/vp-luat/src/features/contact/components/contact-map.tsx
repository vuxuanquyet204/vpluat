// Embed google maps by address query — no API key needed.
// Combines with a full Hanoi office address (Landmark 72, Pham Hung, Nam Tu Liem, Ha Noi).
const OFFICE_QUERY = 'Tầng 15, Tòa nhà Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội';

export function ContactMap() {
  return (
    <div className="contact-map">
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(OFFICE_QUERY)}&hl=vi&z=16&output=embed`}
        width="100%"
        height="380"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Bản đồ Văn phòng Luật Hùng & Cộng sự"
      />
    </div>
  );
}
