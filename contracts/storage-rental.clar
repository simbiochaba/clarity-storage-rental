;; Storage Rental Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-already-listed (err u101))
(define-constant err-not-listed (err u102))
(define-constant err-insufficient-payment (err u103))
(define-constant err-not-renter (err u104))
(define-constant err-invalid-storage (err u105))

;; Data Variables
(define-map storage-spaces
    principal
    {space-size: uint, 
     price-per-block: uint,
     renter: (optional principal),
     rental-start: (optional uint),
     rental-end: (optional uint)}
)

(define-map rentals 
    principal
    {storage-owner: principal,
     blocks-rented: uint,
     total-paid: uint}
)

;; Public Functions
(define-public (list-storage-space (size uint) (price uint))
    (let ((listing {space-size: size,
                   price-per-block: price,
                   renter: none,
                   rental-start: none,
                   rental-end: none}))
        (if (map-get? storage-spaces tx-sender)
            err-already-listed
            (begin
                (map-set storage-spaces tx-sender listing)
                (ok true)))))

(define-public (rent-storage (owner principal) (blocks uint))
    (let ((space (unwrap! (map-get? storage-spaces owner) err-not-listed))
          (total-cost (* blocks (get price-per-block space))))
        (if (is-some (get renter space))
            err-already-listed
            (begin
                (try! (stx-transfer? total-cost tx-sender owner))
                (map-set storage-spaces owner 
                    (merge space 
                        {renter: (some tx-sender),
                         rental-start: (some block-height),
                         rental-end: (some (+ block-height blocks))}))
                (map-set rentals tx-sender 
                    {storage-owner: owner,
                     blocks-rented: blocks,
                     total-paid: total-cost})
                (ok total-cost)))))

(define-public (end-rental (owner principal))
    (let ((space (unwrap! (map-get? storage-spaces owner) err-not-listed)))
        (if (and 
            (is-eq (some tx-sender) (get renter space))
            (>= block-height (unwrap! (get rental-end space) err-not-renter)))
            (begin
                (map-set storage-spaces owner
                    (merge space 
                        {renter: none,
                         rental-start: none,
                         rental-end: none}))
                (ok true))
            err-not-renter)))

;; Read-only Functions
(define-read-only (get-storage-info (owner principal))
    (ok (map-get? storage-spaces owner)))

(define-read-only (get-rental-info (renter principal))
    (ok (map-get? rentals renter)))
