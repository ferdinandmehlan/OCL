function openOCLFiddle(cd4a, ocl) {
  let url = new URL(window.location.href+'../');
  let params = new URLSearchParams();
  params.append('cd', cd4a);
  params.append('ocl', ocl);
  var win = window.open(url.toString()+'?'+params.toString(), '_blank');
  win.focus();
}

function setOCL(ocl) {
  var cd4a = 
`package example.cd;

classdiagram AuctionCD {
    public class Auction {
        public long auctionIdent;
        protected String auctionName;
        private Money bestBid;
        private int numberOfBids;
        private Time startTime;
        private Time closingTime;
        private int activeParticipants;
    }
    public class Person {
        public long personIdent;
        protected String name;
        private boolean isActive;
    }

    association participants [*] Auction (auctions) <-> (bidder) Person [*];
}`;
  openOCLFiddle(cd4a,ocl);
}