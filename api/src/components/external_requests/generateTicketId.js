const generateTicketId = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `TCK${randomNumber}K`;
  };
  
  export default generateTicketId;
